/**
 * Script: seed:intakes
 *
 * Chạy toàn bộ seed intake cho các sector đã có.
 * Sử dụng chung một DataSource. Vector nằm ngay trong intake_chunks,
 * không còn index ngoài để đồng bộ.
 *
 * Usage: npm run seed:intakes
 */

import { config } from 'dotenv';
import {
  createDataSource,
  getOrCreateSeedUser,
  processIntakeSeeds,
  SeedResult,
} from './shared';
import { ALL_SEEDS as CNTT } from './01-cong-nghe-thong-tin';
import { ALL_SEEDS as YTE } from './02-y-te';
import { ALL_SEEDS as DUOC } from './03-duoc-pham';
import { ALL_SEEDS as CHALLENGES } from './04-challenges';

config();

const SECTOR_GROUPS = [
  { label: 'Công nghệ thông tin', seeds: CNTT },
  { label: 'Y tế & Chăm sóc sức khỏe', seeds: YTE },
  { label: 'Dược phẩm & Công nghệ sinh học', seeds: DUOC },
  { label: 'Challenges (buyer)', seeds: CHALLENGES },
];

async function main() {
  console.log('=== seed:intakes — bắt đầu ===\n');

  const ds = createDataSource();
  await ds.initialize();

  const user = await getOrCreateSeedUser(ds);

  const totals: SeedResult = { created: 0, skipped: 0, chunks: 0 };

  for (const group of SECTOR_GROUPS) {
    console.log(`\n--- [${group.label}] (${group.seeds.length} intakes) ---\n`);
    const result = await processIntakeSeeds(ds, user, group.seeds);
    totals.created += result.created;
    totals.skipped += result.skipped;
    totals.chunks += result.chunks;
    console.log(
      `  → created=${result.created}, skipped=${result.skipped}, chunks=${result.chunks}`,
    );
  }

  const [{ count }] = await ds.query<Array<{ count: string }>>(
    `SELECT count(*)::text AS count FROM "intake_chunks" WHERE "emb" IS NOT NULL`,
  );

  console.log('\n' + '='.repeat(60));
  console.log(`Intakes created : ${totals.created}`);
  console.log(`Intakes skipped : ${totals.skipped} (đã tồn tại)`);
  console.log(`Chunks created  : ${totals.chunks}`);
  console.log(`Chunks with vectors: ${count}`);
  console.log('='.repeat(60));

  await ds.destroy();
  console.log('\n=== Done! ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
