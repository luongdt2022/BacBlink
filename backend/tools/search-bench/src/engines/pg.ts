/**
 * PostgreSQL 16 + pgvector engine.
 *
 *  pg-2ch    — dense + lexical only. Strict apples-to-apples against es-fixed:
 *              same two channels, same RRF, so the only variable is the engine.
 *  pg-hybrid — the full proposal: dense + BGE-M3 sparse + phrase lexical
 *              (accented and unaccented) + trigram. Shows what PG can do that
 *              the current ES setup cannot.
 *
 * Fusion happens in SQL, in one round trip. ES needs an msearch plus
 * client-side fusion because native RRF is a paid-tier feature there.
 */
import pg from 'pg';
import type { Chunk } from '../corpus.js';
import { toSparsevec, SPARSE_DIM, type Embedding } from '../embed.js';
import type { Hit } from '../fuse.js';
import type { Filter } from './es.js';

export const pool = new pg.Pool({
  host: process.env.PG_HOST ?? 'localhost',
  port: Number(process.env.PG_PORT ?? 5442),
  database: 'bench',
  user: 'bench',
  password: 'bench',
  max: 8,
});

// --- schema ------------------------------------------------------------------

const SCHEMA = `
DROP TABLE IF EXISTS chunks;

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() is STABLE, not IMMUTABLE, so it cannot be used in a generated
-- column or index expression directly. Pinning the dictionary makes it safe.
CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text AS
$$ SELECT public.unaccent('public.unaccent', $1) $$
LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE;

CREATE TABLE chunks (
  id           bigserial PRIMARY KEY,
  intake_id    text NOT NULL,
  chunk_index  int  NOT NULL,
  text         text NOT NULL,
  intake_title text NOT NULL,
  intake_type  text NOT NULL,
  sector_names text[] NOT NULL,
  emb          vector(1024),
  emb_sparse   sparsevec(${SPARSE_DIM}),
  tsv    tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED,
  tsv_ua tsvector GENERATED ALWAYS AS (to_tsvector('simple', f_unaccent(text))) STORED,
  searchable_ua text GENERATED ALWAYS AS (f_unaccent(intake_title || ' ' || text)) STORED
);
`;

const INDEXES = [
  `SET maintenance_work_mem = '2GB'`,
  `CREATE INDEX chunks_emb_hnsw ON chunks USING hnsw (emb vector_cosine_ops)`,
  `CREATE INDEX chunks_sparse_hnsw ON chunks USING hnsw (emb_sparse sparsevec_ip_ops)`,
  `CREATE INDEX chunks_tsv_gin ON chunks USING gin (tsv)`,
  `CREATE INDEX chunks_tsv_ua_gin ON chunks USING gin (tsv_ua)`,
  `CREATE INDEX chunks_trgm ON chunks USING gin (searchable_ua gin_trgm_ops)`,
  `CREATE INDEX chunks_type ON chunks (intake_type)`,
  `CREATE INDEX chunks_sectors ON chunks USING gin (sector_names)`,
  `ANALYZE chunks`,
];

export async function resetSchema() {
  const c = await pool.connect();
  try {
    await c.query(SCHEMA);
  } finally {
    c.release();
  }
}

export async function createIndexes() {
  const c = await pool.connect();
  try {
    for (const sql of INDEXES) {
      const t = Date.now();
      await c.query(sql);
      if (sql.startsWith('CREATE INDEX')) {
        const name = sql.split(' ')[2];
        console.log(`  PG index ${name}: ${Date.now() - t}ms`);
      }
    }
  } finally {
    c.release();
  }
}

export async function insertChunks(chunks: Chunk[], embs: Embedding[]) {
  const c = await pool.connect();
  try {
    const BATCH = 100;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const slice = chunks.slice(i, i + BATCH);
      const values: string[] = [];
      const params: any[] = [];
      slice.forEach((ch, j) => {
        const e = embs[i + j];
        const b = params.length;
        values.push(
          `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7}::vector,$${b + 8}::sparsevec)`,
        );
        params.push(
          ch.intakeId,
          ch.chunkIndex,
          ch.text,
          ch.intakeTitle,
          ch.intakeType,
          ch.sectorNames,
          JSON.stringify(e.dense),
          toSparsevec(e.sparse),
        );
      });
      await c.query(
        `INSERT INTO chunks
           (intake_id, chunk_index, text, intake_title, intake_type, sector_names, emb, emb_sparse)
         VALUES ${values.join(',')}`,
        params,
      );
      process.stdout.write(
        `\r  PG inserted ${Math.min(i + BATCH, chunks.length)}/${chunks.length}   `,
      );
    }
  } finally {
    c.release();
  }
  process.stdout.write('\n');
}

// --- search ------------------------------------------------------------------

/**
 * One SQL statement: hard filter -> per-channel top-K -> dedupe to best chunk
 * per intake -> RRF. The hard filter sits inside every channel subquery, so a
 * valid candidate can never be lost by being cut from top-K first — the bug
 * that production has today.
 */
function buildSql(channels: 2 | 4): string {
  // The hard filter sits inside every channel's own scan, and each channel
  // over-fetches CHUNKS through its index (ORDER BY ... LIMIT directly on the
  // table, so HNSW/GIN are actually used) before deduplicating to one row per
  // intake. Deduplicating first would force a sequential scan and silently
  // turn every "index" into a full table read.
  const FILTER = `($3::text IS NULL OR intake_type = $3)
      AND ($4::text[] IS NULL OR sector_names && $4)`;

  // Same over-fetch factor ES uses (size = limit * 3) so neither side gets a
  // recall advantage purely from fetching more candidates.
  const dense = `
  dense_raw AS (
    SELECT intake_id, text, emb <=> $1::vector AS d
    FROM chunks
    WHERE ${FILTER}
    ORDER BY emb <=> $1::vector
    LIMIT $5 * 3
  ),
  dense_r AS (
    SELECT intake_id, text, ROW_NUMBER() OVER (ORDER BY d) AS rank
    FROM (
      SELECT DISTINCT ON (intake_id) intake_id, text, d
      FROM dense_raw ORDER BY intake_id, d
    ) x
    ORDER BY d LIMIT $5
  )`;

  const lexical = `
  lex_raw AS (
    SELECT intake_id, text,
           GREATEST(
             ts_rank_cd(tsv,    phraseto_tsquery('simple', $2)),
             ts_rank_cd(tsv_ua, phraseto_tsquery('simple', f_unaccent($2)))
           ) AS s
    FROM chunks
    WHERE ${FILTER}
      AND (tsv @@ phraseto_tsquery('simple', $2)
        OR tsv_ua @@ phraseto_tsquery('simple', f_unaccent($2)))
    ORDER BY s DESC
    LIMIT $5 * 3
  ),
  lex_r AS (
    SELECT intake_id, text, ROW_NUMBER() OVER (ORDER BY s DESC) AS rank
    FROM (
      SELECT DISTINCT ON (intake_id) intake_id, text, s
      FROM lex_raw ORDER BY intake_id, s DESC
    ) x
    ORDER BY s DESC LIMIT $5
  )`;

  const sparse = `
  sp_raw AS (
    SELECT intake_id, text, emb_sparse <#> $6::sparsevec AS d
    FROM chunks
    WHERE ${FILTER}
    ORDER BY emb_sparse <#> $6::sparsevec
    LIMIT $5 * 3
  ),
  sp_r AS (
    SELECT intake_id, text, ROW_NUMBER() OVER (ORDER BY d) AS rank
    FROM (
      SELECT DISTINCT ON (intake_id) intake_id, text, d
      FROM sp_raw ORDER BY intake_id, d
    ) x
    ORDER BY d LIMIT $5
  )`;

  // word_similarity for both the filter and the ranking — mixing %> with
  // similarity() would rank by a different measure than it filtered on.
  const trgm = `
  tg_raw AS (
    SELECT intake_id, text,
           word_similarity(f_unaccent($2), searchable_ua) AS s
    FROM chunks
    WHERE ${FILTER}
      AND f_unaccent($2) <% searchable_ua
    ORDER BY s DESC
    LIMIT $5 * 3
  ),
  tg_r AS (
    SELECT intake_id, text, ROW_NUMBER() OVER (ORDER BY s DESC) AS rank
    FROM (
      SELECT DISTINCT ON (intake_id) intake_id, text, s
      FROM tg_raw ORDER BY intake_id, s DESC
    ) x
    ORDER BY s DESC LIMIT $5
  )`;

  const ctes =
    channels === 2 ? [dense, lexical] : [dense, lexical, sparse, trgm];
  const unions =
    channels === 2
      ? ['SELECT * FROM dense_r', 'SELECT * FROM lex_r']
      : [
          'SELECT * FROM dense_r',
          'SELECT * FROM lex_r',
          'SELECT * FROM sp_r',
          'SELECT * FROM tg_r',
        ];

  // The 2-channel variant never references the sparse vector, and Postgres
  // rejects a bind parameter it cannot type — so the limit takes $6 there
  // and $7 only when $6 is actually the sparsevec.
  const limitParam = channels === 2 ? '$6' : '$7';

  return `
  WITH ${ctes.join(',')},
  fused AS (
    ${unions.join(' UNION ALL ')}
  )
  SELECT intake_id,
         SUM(1.0 / (60 + rank)) AS score,
         (array_agg(text ORDER BY rank))[1] AS chunk_text
  FROM fused
  GROUP BY intake_id
  ORDER BY score DESC
  LIMIT ${limitParam}`;
}

const SQL_2CH = buildSql(2);
const SQL_4CH = buildSql(4);

export async function search(
  variant: '2ch' | 'hybrid',
  query: string,
  qEmb: Embedding,
  limit: number,
  filter: Filter = {},
): Promise<Hit[]> {
  const K = Math.max(limit * 5, 50);
  const c = await pool.connect();
  try {
    // Plain SET, not SET LOCAL: these run outside an explicit transaction, and
    // SET LOCAL there is silently a no-op (it only applies inside a tx block).
    await c.query(`SET hnsw.ef_search = 100`);
    await c.query(`SET hnsw.iterative_scan = relaxed_order`);
    const common: any[] = [
      JSON.stringify(qEmb.dense),
      query,
      filter.type ?? null,
      filter.sectorNames?.length ? filter.sectorNames : null,
      K,
    ];
    const params =
      variant === '2ch'
        ? [...common, limit]
        : [...common, toSparsevec(qEmb.sparse), limit];
    const sql = variant === '2ch' ? SQL_2CH : SQL_4CH;
    const res = await c.query(sql, params);
    return res.rows.map((r) => ({
      intakeId: r.intake_id,
      score: Number(r.score),
      chunkText: r.chunk_text,
    }));
  } finally {
    c.release();
  }
}

export async function stats() {
  const c = await pool.connect();
  try {
    const v = await c.query(
      `SELECT extversion FROM pg_extension WHERE extname='vector'`,
    );
    const size = await c.query(
      `SELECT pg_size_pretty(pg_total_relation_size('chunks')) AS total,
              pg_size_pretty(pg_relation_size('chunks')) AS heap,
              pg_size_pretty(pg_indexes_size('chunks'))  AS indexes`,
    );
    const n = await c.query(`SELECT count(*)::int AS n FROM chunks`);
    return {
      pgvector: v.rows[0]?.extversion,
      chunks: n.rows[0].n,
      ...size.rows[0],
    };
  } finally {
    c.release();
  }
}
