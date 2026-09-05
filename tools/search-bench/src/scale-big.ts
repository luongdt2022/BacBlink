/**
 * Large-scale load test: 1M and 5M chunks.
 *
 * As with scale.ts, vectors are RANDOM. ANN latency and index size depend on
 * row count and dimensionality, not on whether vectors carry meaning, so this
 * measures capacity honestly while measuring nothing about quality.
 *
 * Differences from scale.ts, all forced by the size:
 *   - No sparsevec column. It is unused by the measured query and would add
 *     ~24GB at 5M, which does not fit on this disk.
 *   - Postgres rows are generated INSIDE the database (generate_series), not
 *     shipped from Node. At 5M the JSON-over-TCP path is the bottleneck, not
 *     the database.
 *   - Elasticsearch has no such option — every document must cross HTTP — so
 *     its vectors are rounded to 4 decimals to halve the JSON payload.
 *
 * Usage: npx tsx src/scale-big.ts 1000000 5000000
 */
import { Client } from '@elastic/elasticsearch';
import pg from 'pg';

const es = new Client({
  node: process.env.ES_URL ?? 'http://localhost:9210',
  requestTimeout: 1_800_000,
});
const pool = new pg.Pool({
  host: 'localhost',
  port: 5442,
  database: 'bench',
  user: 'bench',
  password: 'bench',
  max: 4,
  statement_timeout: 0,
  query_timeout: 0,
});

const IDX = 'big_chunks';
const DIM = 1024;
const QUERIES = 40;

const VI_WORDS = [
  'công', 'nghệ', 'sinh', 'học', 'vật', 'liệu', 'nano', 'xử', 'lý', 'nước',
  'thải', 'cảm', 'biến', 'chẩn', 'đoán', 'hình', 'ảnh', 'năng', 'lượng', 'tái',
  'tạo', 'quy', 'trình', 'sản', 'xuất', 'thiết', 'bị', 'y', 'tế', 'dược', 'phẩm',
  'tự', 'động', 'hoá', 'nông', 'nghiệp', 'thông', 'minh', 'dữ', 'liệu', 'phân',
  'tích', 'hệ', 'thống', 'quản', 'giải', 'pháp', 'nền', 'tảng', 'ứng', 'dụng',
];

// --- setup -------------------------------------------------------------------

async function setupEs() {
  if (await es.indices.exists({ index: IDX })) await es.indices.delete({ index: IDX });
  await es.indices.create({
    index: IDX,
    settings: {
      number_of_replicas: 0,
      refresh_interval: '-1',
      'index.translog.durability': 'async',
    },
    mappings: {
      // Measured at 40k docs: Elasticsearch was using 77 KB/doc against
      // Postgres's 9.4 KB/doc, because _source keeps a second copy of every
      // vector as JSON text (1024 full-precision floats ≈ 20 KB). Extrapolated
      // to 5M that is ~385 GB and cannot fit. Excluding the vector from _source
      // is standard practice for a large vector index, so ES gets it here —
      // without it this comparison would be unfair to Elasticsearch.
      _source: { excludes: ['embedding'] },
      properties: {
        intake_id: { type: 'keyword' },
        text: { type: 'text', analyzer: 'standard' },
        embedding: { type: 'dense_vector', dims: DIM, similarity: 'cosine' },
        intake_type: { type: 'keyword' },
      },
    },
  });
}

async function setupPg() {
  const c = await pool.connect();
  await c.query(`DROP TABLE IF EXISTS ${IDX}`);
  await c.query(`
    CREATE TABLE ${IDX} (
      id bigserial PRIMARY KEY,
      intake_id text NOT NULL,
      text text NOT NULL,
      intake_type text NOT NULL,
      emb vector(${DIM}),
      tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED
    )`);
  c.release();
}

// --- load --------------------------------------------------------------------

/** Generated entirely inside Postgres — nothing crosses the wire. */
async function loadPg(from: number, to: number): Promise<number> {
  const c = await pool.connect();
  await c.query(`SET maintenance_work_mem = '8GB'`);
  await c.query(`SET synchronous_commit = off`);

  // A pool of 2000 distinct texts, built once in Node. Generating the text per
  // row inside SQL needed a correlated string_agg, which Postgres rejects here.
  await c.query(`DROP TABLE IF EXISTS text_pool`);
  await c.query(`CREATE TABLE text_pool (i int PRIMARY KEY, t text)`);
  const vals: string[] = [];
  const params: any[] = [];
  for (let i = 0; i < 2000; i++) {
    vals.push(`($${params.length + 1},$${params.length + 2})`);
    params.push(i, randText());
  }
  await c.query(`INSERT INTO text_pool (i,t) VALUES ${vals.join(',')}`, params);

  const t = Date.now();
  const CHUNK = 100_000;
  for (let start = from; start < to; start += CHUNK) {
    const end = Math.min(start + CHUNK, to);
    // `WHERE g IS NOT NULL` makes the vector subquery correlated, so Postgres
    // evaluates it once PER ROW instead of hoisting it to an InitPlan and
    // giving every row the same vector. Verified by verifyDistinctVectors().
    await c.query(
      `INSERT INTO ${IDX} (intake_id, text, intake_type, emb)
       SELECT 's-' || g,
              (SELECT t FROM text_pool WHERE i = (g % 2000)),
              CASE WHEN g % 2 = 0 THEN 'ip' ELSE 'challenge' END,
              (SELECT array_agg((random()*2-1)::real)
                 FROM generate_series(1, ${DIM}) s
                WHERE g IS NOT NULL)::vector
       FROM generate_series($1::bigint, $2::bigint) g`,
      [start + 1, end],
    );
    process.stdout.write(`\r    PG ${end.toLocaleString()}/${to.toLocaleString()}   `);
  }
  c.release();
  process.stdout.write('\n');
  return Date.now() - t;
}

/**
 * Guards against the failure mode where Postgres caches the vector subquery and
 * every row ends up identical — which would make the whole ANN measurement
 * meaningless while still producing plausible-looking numbers.
 */
async function verifyDistinctVectors() {
  const c = await pool.connect();
  const r = await c.query(
    `SELECT count(DISTINCT emb::text) AS distinct_vecs, count(*) AS total
       FROM (SELECT emb FROM ${IDX} LIMIT 500) x`,
  );
  c.release();
  const { distinct_vecs, total } = r.rows[0];
  console.log(`  vector sanity: ${distinct_vecs} distinct of ${total} sampled`);
  if (Number(distinct_vecs) < Number(total) * 0.99) {
    throw new Error(
      `vectors are not distinct (${distinct_vecs}/${total}) — the subquery was hoisted; measurement would be meaningless`,
    );
  }
}

let seed = 987654321;
function rnd(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function randVecRounded(): number[] {
  const v = new Array<number>(DIM);
  for (let i = 0; i < DIM; i++) v[i] = Math.round((rnd() * 2 - 1) * 1e4) / 1e4;
  return v;
}

function randText(): string {
  let s = '';
  for (let i = 0; i < 40; i++) s += VI_WORDS[(rnd() * VI_WORDS.length) | 0] + ' ';
  return s.trim();
}

async function loadEs(from: number, to: number): Promise<number> {
  const BATCH = 2000;
  const t = Date.now();
  for (let i = from; i < to; i += BATCH) {
    const n = Math.min(BATCH, to - i);
    const ops: any[] = new Array(n * 2);
    for (let j = 0; j < n; j++) {
      ops[j * 2] = { index: { _index: IDX, _id: `s-${i + j}` } };
      ops[j * 2 + 1] = {
        intake_id: `s-${i + j}`,
        text: randText(),
        embedding: randVecRounded(),
        intake_type: (i + j) % 2 === 0 ? 'ip' : 'challenge',
      };
    }
    const r = await es.bulk({ operations: ops, refresh: false });
    if (r.errors) {
      const bad = r.items.find((it: any) => it.index?.error);
      throw new Error(`ES bulk: ${JSON.stringify(bad?.index?.error)}`);
    }
    if ((i - from) % 50000 < BATCH) {
      const rate = Math.round((i + n - from) / ((Date.now() - t) / 1000));
      process.stdout.write(
        `\r    ES ${(i + n).toLocaleString()}/${to.toLocaleString()}  ${rate}/s   `,
      );
    }
  }
  process.stdout.write('\n');
  return Date.now() - t;
}

// --- index / measure ---------------------------------------------------------

async function buildPgIndexes() {
  const c = await pool.connect();
  await c.query(`SET maintenance_work_mem = '12GB'`);
  await c.query(`SET max_parallel_maintenance_workers = 7`);
  let t = Date.now();
  await c.query(`CREATE INDEX ON ${IDX} USING hnsw (emb vector_cosine_ops)`);
  const hnsw = Date.now() - t;
  t = Date.now();
  await c.query(`CREATE INDEX ON ${IDX} USING gin (tsv)`);
  const gin = Date.now() - t;
  await c.query(`CREATE INDEX ON ${IDX} (intake_type)`);
  await c.query(`ANALYZE ${IDX}`);
  c.release();
  return { hnsw, gin };
}

async function buildEsIndex() {
  const t = Date.now();
  await es.indices.putSettings({ index: IDX, settings: { refresh_interval: '1s' } });
  await es.indices.refresh({ index: IDX });
  await es.indices.forcemerge({ index: IDX, max_num_segments: 1 });
  return Date.now() - t;
}

function pctl(xs: number[], p: number) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

async function measure() {
  const qs = Array.from({ length: QUERIES }, () => ({
    v: randVecRounded(),
    t: randText().split(' ').slice(0, 6).join(' '),
  }));

  const esL: number[] = [];
  for (const q of qs) {
    const t = process.hrtime.bigint();
    await es.search({
      index: IDX,
      knn: { field: 'embedding', query_vector: q.v, k: 30, num_candidates: 100 },
      query: {
        bool: {
          should: [{ match: { text: q.t } }],
          filter: [{ term: { intake_type: 'ip' } }],
        },
      },
      size: 30,
      _source: ['intake_id'],
    });
    esL.push(Number(process.hrtime.bigint() - t) / 1e6);
  }

  const pgL: number[] = [];
  const c = await pool.connect();
  await c.query(`SET hnsw.ef_search = 100`);
  await c.query(`SET hnsw.iterative_scan = relaxed_order`);
  for (const q of qs) {
    const t = process.hrtime.bigint();
    await c.query(
      `WITH d AS (
         SELECT intake_id, emb <=> $1::vector AS s FROM ${IDX}
         WHERE intake_type = 'ip' ORDER BY emb <=> $1::vector LIMIT 90
       ), l AS (
         SELECT intake_id, ts_rank_cd(tsv, plainto_tsquery('simple',$2)) AS s FROM ${IDX}
         WHERE intake_type = 'ip' AND tsv @@ plainto_tsquery('simple',$2)
         ORDER BY s DESC LIMIT 90
       )
       SELECT intake_id, SUM(1.0/(60+r)) sc FROM (
         SELECT intake_id, ROW_NUMBER() OVER (ORDER BY s) r FROM d
         UNION ALL
         SELECT intake_id, ROW_NUMBER() OVER (ORDER BY s DESC) r FROM l
       ) u GROUP BY intake_id ORDER BY sc DESC LIMIT 30`,
      [JSON.stringify(q.v), q.t],
    );
    pgL.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  c.release();
  return { esL, pgL };
}

async function sizes() {
  const s: any = await es.indices.stats({ index: IDX });
  const c = await pool.connect();
  const r = await c.query(
    `SELECT pg_total_relation_size('${IDX}') t, pg_indexes_size('${IDX}') i`,
  );
  c.release();
  return {
    esGB: s.indices[IDX].total.store.size_in_bytes / 1e9,
    pgGB: Number(r.rows[0].t) / 1e9,
    pgIdxGB: Number(r.rows[0].i) / 1e9,
  };
}

async function freeDiskGB(): Promise<number> {
  const c = await pool.connect();
  const r = await c.query(`SELECT 1`).then(() => null).catch(() => null);
  c.release();
  void r;
  return 0;
}

// --- main --------------------------------------------------------------------

async function main() {
  const steps = process.argv.slice(2).map(Number).filter(Boolean);
  if (!steps.length) steps.push(1_000_000);

  await setupEs();
  await setupPg();
  void freeDiskGB;

  const table: any[] = [];
  let loaded = 0;

  for (const target of steps) {
    console.log(`\n=== scaling to ${target.toLocaleString()} rows ===`);

    console.log('  loading Postgres (in-database generation)...');
    const pgLoad = await loadPg(loaded, target);
    await verifyDistinctVectors();
    console.log('  loading Elasticsearch (bulk over HTTP)...');
    const esLoad = await loadEs(loaded, target);
    loaded = target;

    console.log('  building indexes...');
    const tEs = await buildEsIndex();
    const pgIdx = await buildPgIndexes();
    const sz = await sizes();

    console.log('  measuring...');
    const { esL, pgL } = await measure();

    const row = {
      rows: target.toLocaleString(),
      pgLoadMin: +(pgLoad / 60000).toFixed(1),
      esLoadMin: +(esLoad / 60000).toFixed(1),
      pgHnswMin: +(pgIdx.hnsw / 60000).toFixed(1),
      esMergeMin: +(tEs / 60000).toFixed(1),
      pgGB: +sz.pgGB.toFixed(1),
      esGB: +sz.esGB.toFixed(1),
      pgP50: +pctl(pgL, 50).toFixed(0),
      pgP95: +pctl(pgL, 95).toFixed(0),
      esP50: +pctl(esL, 50).toFixed(0),
      esP95: +pctl(esL, 95).toFixed(0),
    };
    table.push(row);
    console.table([row]);

    if (target !== steps[steps.length - 1]) {
      const c = await pool.connect();
      await c.query(`DROP INDEX IF EXISTS ${IDX}_emb_idx`);
      await c.query(`DROP INDEX IF EXISTS ${IDX}_tsv_idx`);
      await c.query(`DROP INDEX IF EXISTS ${IDX}_intake_type_idx`);
      c.release();
      await es.indices.putSettings({ index: IDX, settings: { refresh_interval: '-1' } });
    }
  }

  console.log('\n=== LOAD TEST SUMMARY (capacity only — not quality) ===');
  console.table(table);
  await pool.end();
}

main().catch((e) => {
  console.error(e?.meta?.body ?? e);
  process.exit(1);
});
