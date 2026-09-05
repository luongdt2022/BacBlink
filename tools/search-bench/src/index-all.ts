/** Builds the corpus, embeds it once (cached), and loads both engines. */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { buildCorpus, chunkIntake, stripHtml, type Chunk } from './corpus.js';
import { PROBE_DOCS } from './goldenset.js';
import { embed, waitForRag, SPARSE_DIM, type Embedding } from './embed.js';
import * as ES from './engines/es.js';
import * as PG from './engines/pg.js';

const CACHE_DIR = new URL('../.cache/', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1',
);
const EMB_CACHE = `${CACHE_DIR}chunk-embeddings.json`;

function saveEmbeddings(embs: Embedding[]) {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(
    EMB_CACHE,
    JSON.stringify(
      embs.map((e) => ({ d: e.dense, s: [...e.sparse.entries()] })),
      null,
      0,
    ),
  );
}

function loadEmbeddings(): Embedding[] | null {
  if (!existsSync(EMB_CACHE)) return null;
  const raw = JSON.parse(readFileSync(EMB_CACHE, 'utf8'));
  return raw.map((r: any) => ({
    dense: r.d,
    sparse: new Map<number, number>(r.s),
  }));
}

async function main() {
  console.log('=== Building corpus ===');
  const { intakes } = buildCorpus();
  const all = [...intakes, ...PROBE_DOCS];
  const chunks: Chunk[] = all.flatMap(chunkIntake).filter((c) => c.text);

  console.log(`  intakes: ${all.length} (${PROBE_DOCS.length} probes)`);
  console.log(`  chunks : ${chunks.length}`);
  console.log(
    `  avg chunk len: ${Math.round(
      chunks.reduce((s, c) => s + c.text.length, 0) / chunks.length,
    )} chars`,
  );

  // Persist corpus metadata for the bench run.
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(
    `${CACHE_DIR}corpus.json`,
    JSON.stringify({
      intakes: all,
      strippedBody: Object.fromEntries(
        all.map((i) => [i.id, stripHtml(i.content)]),
      ),
    }),
  );

  console.log('\n=== Embedding (BGE-M3, dense + sparse) ===');
  let embs = loadEmbeddings();
  if (embs && embs.length === chunks.length) {
    console.log(`  cache hit — ${embs.length} vectors`);
  } else {
    await waitForRag();
    const t = Date.now();
    embs = await embed(
      chunks.map((c) => c.text),
      { sparse: true, batchSize: 8 },
    );
    console.log(`  embedded ${embs.length} chunks in ${Date.now() - t}ms`);
    saveEmbeddings(embs);
  }

  const nz = embs.reduce((s, e) => s + e.sparse.size, 0) / embs.length;
  console.log(`  sparse non-zero avg: ${nz.toFixed(1)} / ${SPARSE_DIM}`);

  console.log('\n=== Elasticsearch ===');
  await ES.resetIndices();
  await ES.indexChunks(chunks, embs);
  const esStats: any = await ES.es.indices.stats({
    index: [ES.IDX_CURRENT, ES.IDX_FIXED],
  });
  for (const idx of [ES.IDX_CURRENT, ES.IDX_FIXED]) {
    const s = esStats.indices[idx].total;
    console.log(
      `  ${idx}: ${s.docs.count} docs, ${(s.store.size_in_bytes / 1e6).toFixed(1)} MB`,
    );
  }

  console.log('\n=== PostgreSQL ===');
  await PG.resetSchema();
  await PG.insertChunks(chunks, embs);
  await PG.createIndexes();
  console.log('  ', await PG.stats());

  await PG.pool.end();
  console.log('\nIndexing complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
