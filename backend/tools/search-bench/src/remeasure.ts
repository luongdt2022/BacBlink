/**
 * Re-measures the already-loaded 1M dataset with a like-for-like filter.
 *
 * The first run applied `intake_type = 'ip'` only to Elasticsearch's BM25
 * clause, leaving its kNN unfiltered, while Postgres filtered inside the ANN
 * scan. That made ES look faster than a fair comparison allows. Here both
 * engines filter inside the vector channel, and both are also measured
 * unfiltered so the cost of filtered ANN is visible on each side.
 */
import { Client } from '@elastic/elasticsearch';
import pg from 'pg';

const es = new Client({
  node: process.env.ES_URL ?? 'http://localhost:9210',
  requestTimeout: 600_000,
});
const pool = new pg.Pool({
  host: 'localhost', port: 5442, database: 'bench',
  user: 'bench', password: 'bench', max: 4,
});

const IDX = 'big_chunks';
const DIM = 1024;
const N = 40;

const VI_WORDS = [
  'công','nghệ','sinh','học','vật','liệu','nano','xử','lý','nước','thải','cảm',
  'biến','chẩn','đoán','hình','ảnh','năng','lượng','tái','tạo','quy','trình',
  'sản','xuất','thiết','bị','y','tế','dược','phẩm','tự','động','hoá','nông',
  'nghiệp','thông','minh','dữ','liệu','phân','tích','hệ','thống','quản','giải',
  'pháp','nền','tảng','ứng','dụng',
];

let seed = 4242;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

function q() {
  const v = new Array<number>(DIM);
  for (let i = 0; i < DIM; i++) v[i] = Math.round((rnd() * 2 - 1) * 1e4) / 1e4;
  let t = '';
  for (let i = 0; i < 6; i++) t += VI_WORDS[(rnd() * VI_WORDS.length) | 0] + ' ';
  return { v, t: t.trim() };
}

const pctl = (xs: number[], p: number) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

async function runEs(qs: ReturnType<typeof q>[], filtered: boolean) {
  const L: number[] = [];
  for (const x of qs) {
    const knn: any = {
      field: 'embedding', query_vector: x.v, k: 30, num_candidates: 100,
    };
    if (filtered) knn.filter = { term: { intake_type: 'ip' } };
    const t = process.hrtime.bigint();
    await es.search({
      index: IDX,
      knn,
      query: {
        bool: {
          should: [{ match: { text: x.t } }],
          filter: filtered ? [{ term: { intake_type: 'ip' } }] : [],
        },
      },
      size: 30,
      _source: ['intake_id'],
    });
    L.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  return L;
}

async function runPg(qs: ReturnType<typeof q>[], filtered: boolean) {
  const L: number[] = [];
  const c = await pool.connect();
  await c.query(`SET hnsw.ef_search = 100`);
  await c.query(`SET hnsw.iterative_scan = relaxed_order`);
  const w = filtered ? `WHERE intake_type = 'ip'` : '';
  const wAnd = filtered ? `intake_type = 'ip' AND` : '';
  for (const x of qs) {
    const t = process.hrtime.bigint();
    await c.query(
      `WITH d AS (
         SELECT intake_id, emb <=> $1::vector AS s FROM ${IDX}
         ${w} ORDER BY emb <=> $1::vector LIMIT 90
       ), l AS (
         SELECT intake_id, ts_rank_cd(tsv, plainto_tsquery('simple',$2)) AS s
         FROM ${IDX}
         WHERE ${wAnd} tsv @@ plainto_tsquery('simple',$2)
         ORDER BY s DESC LIMIT 90
       )
       SELECT intake_id, SUM(1.0/(60+r)) sc FROM (
         SELECT intake_id, ROW_NUMBER() OVER (ORDER BY s) r FROM d
         UNION ALL
         SELECT intake_id, ROW_NUMBER() OVER (ORDER BY s DESC) r FROM l
       ) u GROUP BY intake_id ORDER BY sc DESC LIMIT 30`,
      [JSON.stringify(x.v), x.t],
    );
    L.push(Number(process.hrtime.bigint() - t) / 1e6);
  }
  c.release();
  return L;
}

async function main() {
  const c = await pool.connect();
  const n = await c.query(`SELECT count(*)::int n FROM ${IDX}`);
  c.release();
  console.log(`rows: ${n.rows[0].n.toLocaleString()}\n`);

  const qs = Array.from({ length: N }, q);
  const rows: any[] = [];

  for (const filtered of [false, true]) {
    // warm-up, not recorded
    await runEs(qs.slice(0, 5), filtered);
    await runPg(qs.slice(0, 5), filtered);

    const esL = await runEs(qs, filtered);
    const pgL = await runPg(qs, filtered);
    rows.push({
      mode: filtered ? 'filtered ANN' : 'unfiltered ANN',
      esP50: +pctl(esL, 50).toFixed(0),
      esP95: +pctl(esL, 95).toFixed(0),
      pgP50: +pctl(pgL, 50).toFixed(0),
      pgP95: +pctl(pgL, 95).toFixed(0),
    });
  }

  console.table(rows);
  await pool.end();
}

main().catch((e) => {
  console.error(e?.meta?.body ?? e);
  process.exit(1);
});
