/**
 * Re-embeds every intake chunk and writes dense + sparse vectors into
 * intake_chunks. Replaces `reindex:es`.
 *
 * Run this after MigrateSearchToPgvector: the migration backfills `emb` by
 * casting the old double precision[] column, but sparse vectors have never
 * existed and can only come from the model.
 *
 *   npm run reindex:pg              # only chunks missing vectors
 *   npm run reindex:pg -- --all     # every chunk
 */
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const BGE_M3_URL = process.env.BGE_M3_URL ?? 'http://localhost:8003';
const SPARSE_DIM = 250002;
const SPARSE_MAX_NNZ = 1000;
const BATCH = 16;

function toSparsevec(sparse: Record<string, number>): string {
  const entries = Object.entries(sparse)
    .map(([t, w]) => [Number(t) + 1, Number(w)] as const)
    .filter(
      ([i, w]) => Number.isFinite(w) && w > 0 && i >= 1 && i <= SPARSE_DIM,
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, SPARSE_MAX_NNZ)
    .sort((a, b) => a[0] - b[0]);
  if (entries.length === 0) return `{}/${SPARSE_DIM}`;
  return `{${entries.map(([i, w]) => `${i}:${w}`).join(',')}}/${SPARSE_DIM}`;
}

async function embedHybrid(texts: string[]) {
  const res = await fetch(`${BGE_M3_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: texts,
      batch_size: BATCH,
      return_dense: true,
      return_sparse: true,
      return_colbert: false,
    }),
  });
  if (!res.ok) {
    throw new Error(`BGE-M3 ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as {
    dense: number[][];
    sparse: Array<Record<string, number>> | null;
  };
}

async function main() {
  const all = process.argv.includes('--all');

  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'dmst_poc',
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    synchronize: false,
    logging: false,
  });
  await ds.initialize();

  const where = all ? '' : `WHERE "emb" IS NULL OR "emb_sparse" IS NULL`;

  const rows = await ds.query<
    Array<{ intake_id: string; index: number; text: string }>
  >(`SELECT "intake_id", "index", "text" FROM "intake_chunks" ${where}
      ORDER BY "intake_id", "index"`);

  console.log(`Chunks to reindex: ${rows.length}${all ? ' (--all)' : ''}`);
  if (rows.length === 0) {
    await ds.destroy();
    return;
  }

  let done = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    try {
      const emb = await embedHybrid(slice.map((r) => r.text));

      await ds.transaction(async (m) => {
        for (let j = 0; j < slice.length; j++) {
          await m.query(
            `UPDATE "intake_chunks"
                SET "emb" = $1::vector, "emb_sparse" = $2::sparsevec
              WHERE "intake_id" = $3 AND "index" = $4`,
            [
              JSON.stringify(emb.dense[j]),
              toSparsevec(emb.sparse?.[j] ?? {}),
              slice[j].intake_id,
              slice[j].index,
            ],
          );
        }
      });
      done += slice.length;
    } catch (err) {
      // Report and continue: one bad batch must not abandon the whole reindex.
      failed += slice.length;
      console.error(
        `  batch at ${i} failed (${slice.length} chunks): ${String(err)}`,
      );
    }
    process.stdout.write(`\r  ${done + failed}/${rows.length}   `);
  }

  process.stdout.write('\n');

  const [stat] = await ds.query<Array<{ total: string; missing: string }>>(
    `SELECT count(*) AS total,
            count(*) FILTER (WHERE "emb" IS NULL OR "emb_sparse" IS NULL) AS missing
       FROM "intake_chunks"`,
  );

  console.log(`Reindexed ${done}, failed ${failed}`);
  console.log(
    `Chunks total ${stat.total}, still missing vectors ${stat.missing}`,
  );

  await ds.destroy();
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
