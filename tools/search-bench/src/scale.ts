/**
 * Scale benchmark: latency, index build time and index size as the corpus grows.
 *
 * Vectors here are RANDOM, not BGE-M3 output. That is deliberate and it is the
 * only honest way to reach 200k chunks without days of CPU embedding. It means
 * this script measures *nothing* about retrieval quality — ANN latency and index
 * size depend on dimensionality and row count, not on whether the vectors carry
 * meaning. Quality lives in run.ts; speed lives here. Do not mix the two.
 *
 *   npx tsx src/scale.ts 10000 50000 200000
 */
import { Client } from '@elastic/elasticsearch';
import pg from 'pg';
import { buildCorpus, stripHtml } from './corpus.js';
import { SPARSE_DIM } from './embed.js';

const ES_URL = process.env.ES_URL ?? 'http://localhost:9210';
const es = new Client({ node: ES_URL, requestTimeout: 600_000 });
const pool = new pg.Pool({
  host: 'localhost',
  port: 5442,
  database: 'bench',
  user: 'bench',
  password: 'bench',
  max: 4,
});

const IDX = 'scale_chunks';
const DIM = 1024;
const SPARSE_NNZ = 300;
const QUERIES = 60;

// --- synthetic data ----------------------------------------------------------

let seed = 12345;
function rnd(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function randVec(): number[] {
  const v = Array.from({ length: DIM }, () => rnd() * 2 - 1);
  const n = Math.hypot(...v);
  return v.map((x) => x / n);
}

function randSparse(): string {
  const idx = new Set<number>();
  while (idx.size < SPARSE_NNZ) idx.add(Math.floor(rnd() * (SPARSE_DIM - 1)) + 1);
  return `{${[...idx]
    .sort((a, b) => a - b)
    .map((i) => `${i}:${(rnd() * 0.5 + 0.05).toFixed(4)}`)
    .join(',')}}/${SPARSE_DIM}`;
}

/** Real Vietnamese sentences, recombined — keeps token statistics realistic. */
function sentencePool(): string[] {
  const { intakes } = buildCorpus();
  return intakes
    .flatMap((i) => stripHtml(i.content).split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter((s) => s.length > 40);
}

function makeText(pool: string[]): string {
  const n = 3 + Math.floor(rnd() * 5);
  return Array.from({ length: n }, () => pool[Math.floor(rnd() * pool.length)]).join(' ');
}

// --- setup -------------------------------------------------------------------

async function setupEs() {
  if (await es.indices.exists({ index: IDX })) {
    await es.indices.delete({ index: IDX });
  }
  await es.indices.create({
    index: IDX,
    settings: { number_of_replicas: 0, refresh_interval: '-1' },
    mappings: {
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
      emb_sparse sparsevec(${SPARSE_DIM}),
      tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED
    )`);
  c.release();
}

// --- load --------------------------------------------------------------------

async function load(n: number, pool_: string[]) {
  const BATCH = 500;
  const c = await pool.connect();
  const tEs = { ms: 0 };
  const tPg = { ms: 0 };

  for (let i = 0; i < n; i += BATCH) {
    const size = Math.min(BATCH, n - i);
    const rows = Array.from({ length: size }, (_, j) => ({
      id: `s-${i + j}`,
      text: makeText(pool_),
      type: (i + j) % 2 === 0 ? 'ip' : 'challenge',
      emb: randVec(),
      sparse: randSparse(),
    }));

    let t = Date.now();
    const ops: any[] = [];
    for (const r of rows) {
      ops.push({ index: { _index: IDX, _id: r.id } });
      ops.push({ intake_id: r.id, text: r.text, embedding: r.emb, intake_type: r.type });
    }
    const res = await es.bulk({ operations: ops, refresh: false });
    if (res.errors) throw new Error('ES bulk failed');
    tEs.ms += Date.now() - t;

    t = Date.now();
    const vals: string[] = [];
    const params: any[] = [];
    rows.forEach((r) => {
      const b = params.length;
      vals.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4}::vector,$${b + 5}::sparsevec)`);
      params.push(r.id, r.text, r.type, JSON.stringify(r.emb), r.sparse);
    });
    await c.query(
      `INSERT INTO ${IDX} (intake_id, text, intake_type, emb, emb_sparse) VALUES ${vals.join(',')}`,
      params,
    );
    tPg.ms += Date.now() - t;

    process.stdout.write(`\r    loading ${i + size}/${n}   `);
  }
  c.release();
  process.stdout.write('\n');
  return { esLoadMs: tEs.ms, pgLoadMs: tPg.ms };
}

async function buildIndexes() {
  let t = Date.now();
  await es.indices.refresh({ index: IDX });
  await es.indices.forcemerge({ index: IDX, max_num_segments: 1 });
  const esIndexMs = Date.now() - t;

  const c = await pool.connect();
  await c.query(`SET maintenance_work_mem = '2GB'`);
  await c.query(`SET max_parallel_maintenance_workers = 4`);
  t = Date.now();
  await c.query(`CREATE INDEX ON ${IDX} USING hnsw (emb vector_cosine_ops)`);
  const pgHnswMs = Date.now() - t;
  t = Date.now();
  await c.query(`CREATE INDEX ON ${IDX} USING gin (tsv)`);
  const pgGinMs = Date.now() - t;
  await c.query(`ANALYZE ${IDX}`);
  c.release();
  return { esIndexMs, pgHnswMs, pgGinMs };
}

async function sizes() {
  const s: any = await es.indices.stats({ index: IDX });
  const c = await pool.connect();
  const r = await c.query(
    `SELECT pg_total_relation_size('${IDX}') AS total, pg_indexes_size('${IDX}') AS idx`,
  );
  c.release();
  return {
    esMB: s.indices[IDX].total.store.size_in_bytes / 1e6,
    pgTotalMB: Number(r.rows[0].total) / 1e6,
    pgIdxMB: Number(r.rows[0].idx) / 1e6,
  };
}

// --- query -------------------------------------------------------------------

function pctl(xs: number[], p: number) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

async function measure(pool_: string[]) {
  const qs = Array.from({ length: QUERIES }, () => ({
    v: randVec(),
    t: makeText(pool_).slice(0, 120),
  }));

  const esL: number[] = [];
  for (const q of qs) {
    const t = process.hrtime.bigint();
    await es.search({
      index: IDX,
      knn: { field: 'embedding', query_vector: q.v, k: 30, num_candidates: 100 },
      query: { bool: { should: [{ match: { text: q.t } }], filter: [{ term: { intake_type: 'ip' } }] } },
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

// --- main --------------------------------------------------------------------

async function main() {
  const steps = (process.argv.slice(2).map(Number).filter(Boolean).length
    ? process.argv.slice(2).map(Number).filter(Boolean)
    : [10_000, 50_000, 200_000]) as number[];

  const pool_ = sentencePool();
  console.log(`sentence pool: ${pool_.length} real Vietnamese sentences\n`);

  const table: any[] = [];
  await setupEs();
  await setupPg();

  let loaded = 0;
  for (const target of steps) {
    console.log(`=== scaling to ${target.toLocaleString()} chunks ===`);
    const { esLoadMs, pgLoadMs } = await load(target - loaded, pool_);
    loaded = target;

    console.log('  building indexes...');
    const idx = await buildIndexes();
    const sz = await sizes();
    console.log('  measuring...');
    const { esL, pgL } = await measure(pool_);

    const row = {
      chunks: target,
      esLoadS: +(esLoadMs / 1000).toFixed(1),
      pgLoadS: +(pgLoadMs / 1000).toFixed(1),
      esMergeS: +(idx.esIndexMs / 1000).toFixed(1),
      pgHnswS: +(idx.pgHnswMs / 1000).toFixed(1),
      pgGinS: +(idx.pgGinMs / 1000).toFixed(1),
      esMB: Math.round(sz.esMB),
      pgMB: Math.round(sz.pgTotalMB),
      esP50: +pctl(esL, 50).toFixed(1),
      esP95: +pctl(esL, 95).toFixed(1),
      pgP50: +pctl(pgL, 50).toFixed(1),
      pgP95: +pctl(pgL, 95).toFixed(1),
    };
    table.push(row);
    console.table([row]);

    // Drop PG indexes so the next increment loads without maintaining them.
    if (target !== steps[steps.length - 1]) {
      const c = await pool.connect();
      await c.query(`DROP INDEX IF EXISTS ${IDX}_emb_idx`);
      await c.query(`DROP INDEX IF EXISTS ${IDX}_tsv_idx`);
      c.release();
    }
  }

  console.log('\n=== SCALE SUMMARY (latency only — says nothing about quality) ===');
  console.table(table);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
