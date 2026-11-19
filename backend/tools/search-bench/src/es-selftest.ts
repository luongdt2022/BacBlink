/** Validates ES mappings, bulk indexing and both query shapes without BGE-M3. */
import * as ES from './engines/es.js';
import { SPARSE_DIM, type Embedding } from './embed.js';
import type { Chunk } from './corpus.js';

function fakeEmb(seed: number): Embedding {
  const dense = Array.from({ length: 1024 }, (_, i) => Math.sin(seed * 0.37 + i * 0.11));
  const norm = Math.hypot(...dense);
  const sparse = new Map<number, number>();
  for (let i = 0; i < 50; i++) {
    sparse.set(((seed * 7919 + i * 131) % (SPARSE_DIM - 1)) + 1, 0.2);
  }
  return { dense: dense.map((v) => v / norm), sparse };
}

const DOCS: Array<[string, string, 'ip' | 'challenge']> = [
  [
    'bio',
    'Quy trình ứng dụng công nghệ sinh học để lên men và tinh chế chế phẩm enzyme dùng trong nông nghiệp.',
    'ip',
  ],
  [
    'decoy',
    'Nền tảng công nghệ quản lý học liệu số. Hệ thống công nghệ trình chiếu giúp người học tra cứu tài liệu học tập.',
    'ip',
  ],
  [
    'ident',
    'Sáng chế được cấp bằng độc quyền số VN1-0012345, mã sản phẩm thương mại NCT-BIO-2024-X7.',
    'ip',
  ],
  [
    'chal',
    'Chúng tôi cần tìm giải pháp xử lý nước thải công nghiệp cho nhà máy dệt nhuộm.',
    'challenge',
  ],
];

async function main() {
  console.log('=== reset indices ===');
  await ES.resetIndices();

  const chunks: Chunk[] = DOCS.map(([id, text, type]) => ({
    intakeId: id,
    chunkIndex: 0,
    text,
    intakeTitle: `Tài liệu ${id}`,
    intakeType: type,
    sectorNames: ['Công nghệ thông tin'],
  }));
  const embs = chunks.map((_, i) => fakeEmb(i + 1));

  console.log('=== bulk index ===');
  await ES.indexChunks(chunks, embs);

  const stats: any = await ES.es.indices.stats({ index: [ES.IDX_CURRENT, ES.IDX_FIXED] });
  for (const idx of [ES.IDX_CURRENT, ES.IDX_FIXED]) {
    console.log(`  ${idx}: ${stats.indices[idx].total.docs.count} docs`);
  }

  const q = fakeEmb(1);
  const probes: Array<[string, string, ES.Filter]> = [
    ['phrase', 'công nghệ sinh học', {}],
    ['no-accent', 'cong nghe sinh hoc', {}],
    ['identifier', 'VN1-0012345', {}],
    ['filtered', 'công nghệ', { type: 'challenge' }],
  ];

  console.log('\n=== es-current (production replica, minScore=2.0) ===');
  for (const [label, query, filter] of probes) {
    const t = Date.now();
    const hits = await ES.searchCurrent(query, q, 10, filter);
    console.log(
      `  ${label.padEnd(11)} -> ${String(hits.length).padStart(2)} hits ${Date.now() - t}ms  ` +
        hits.map((h) => `${h.intakeId}:${h.score.toFixed(2)}`).join(' '),
    );
  }

  console.log('\n=== es-fixed (RRF over msearch) ===');
  for (const [label, query, filter] of probes) {
    const t = Date.now();
    const hits = await ES.searchFixed(query, q, 10, filter);
    console.log(
      `  ${label.padEnd(11)} -> ${String(hits.length).padStart(2)} hits ${Date.now() - t}ms  ` +
        hits.map((h) => `${h.intakeId}:${h.score.toFixed(4)}`).join(' '),
    );
  }

  console.log('\nES self-test OK.');
}

main().catch((e) => {
  console.error('SELF-TEST FAILED:', e?.meta?.body ?? e);
  process.exit(1);
});
