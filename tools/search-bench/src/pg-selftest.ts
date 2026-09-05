/** Validates the PG schema, indexes and both query shapes without BGE-M3. */
import * as PG from './engines/pg.js';
import { SPARSE_DIM, type Embedding } from './embed.js';
import type { Chunk } from './corpus.js';

function fakeEmb(seed: number): Embedding {
  const dense = Array.from({ length: 1024 }, (_, i) =>
    Math.sin(seed * 0.37 + i * 0.11),
  );
  const norm = Math.hypot(...dense);
  const sparse = new Map<number, number>();
  for (let i = 0; i < 300; i++) {
    sparse.set(((seed * 7919 + i * 131) % (SPARSE_DIM - 1)) + 1, 0.1 + (i % 9) / 10);
  }
  return { dense: dense.map((v) => v / norm), sparse };
}

const SAMPLE = [
  'Quy trình ứng dụng công nghệ sinh học để lên men enzyme phục vụ nông nghiệp.',
  'Nền tảng công nghệ quản lý học liệu số, hỗ trợ người học tra cứu tài liệu học tập.',
  'Sáng chế được cấp bằng độc quyền số VN1-0012345, mã sản phẩm NCT-BIO-2024-X7.',
  'Hệ thống hoà giải tranh chấp trực tuyến, số hoá toàn bộ biên bản hoà giải.',
];

async function main() {
  console.log('=== reset schema ===');
  await PG.resetSchema();

  const chunks: Chunk[] = SAMPLE.map((text, i) => ({
    intakeId: `t-${i}`,
    chunkIndex: 0,
    text,
    intakeTitle: `Tài liệu thử ${i}`,
    intakeType: i % 2 === 0 ? 'ip' : 'challenge',
    sectorNames: ['Công nghệ thông tin'],
  }));
  const embs = chunks.map((_, i) => fakeEmb(i + 1));

  console.log('=== insert ===');
  await PG.insertChunks(chunks, embs);

  console.log('=== create indexes ===');
  await PG.createIndexes();
  console.log('  stats:', await PG.stats());

  const q = fakeEmb(2);
  for (const variant of ['2ch', 'hybrid'] as const) {
    for (const [label, filter] of [
      ['no filter', {}],
      ['type=ip', { type: 'ip' as const }],
      ['type+sector', { type: 'ip' as const, sectorNames: ['Công nghệ thông tin'] }],
    ] as const) {
      const t = Date.now();
      const hits = await PG.search(variant, 'công nghệ sinh học', q, 10, filter);
      console.log(
        `  ${variant.padEnd(7)} ${String(label).padEnd(12)} -> ${hits.length} hits in ${Date.now() - t}ms  ${hits
          .map((h) => `${h.intakeId}:${h.score.toFixed(4)}`)
          .join(' ')}`,
      );
    }
  }

  // Exercise the trigram/exact path explicitly.
  const idHits = await PG.search('hybrid', 'VN1-0012345', q, 10);
  console.log(`  identifier query -> ${idHits.map((h) => h.intakeId).join(', ')}`);

  // Confirm the planner actually uses HNSW rather than a sequential scan.
  const c = await PG.pool.connect();
  await c.query(`SET hnsw.ef_search = 100`);
  const plan = await c.query(
    `EXPLAIN (FORMAT TEXT)
     SELECT intake_id FROM chunks
     WHERE (NULL::text IS NULL OR intake_type = NULL)
     ORDER BY emb <=> $1::vector LIMIT 30`,
    [JSON.stringify(q.dense)],
  );
  console.log('\n=== dense channel plan ===');
  for (const r of plan.rows) console.log('  ' + r['QUERY PLAN']);
  c.release();

  await PG.pool.end();
  console.log('\nPG self-test OK.');
}

main().catch((e) => {
  console.error('SELF-TEST FAILED:', e);
  process.exit(1);
});
