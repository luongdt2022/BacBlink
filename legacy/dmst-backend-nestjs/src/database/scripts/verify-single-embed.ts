/**
 * Proves the chunk-embed pipeline calls BGE-M3 exactly ONCE per intake.
 *
 * An earlier revision embedded twice: the processor fetched dense vectors, then
 * SearchService.indexIntake re-embedded the same chunks to obtain the sparse
 * ones. Type-checking cannot catch that — only counting real calls to the model
 * can, so this counts them.
 *
 *   npx ts-node -r tsconfig-paths/register src/database/scripts/verify-single-embed.ts
 */
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AiService } from '../../ai/ai.service';
import { SearchService } from '../../search/search.service';
import { BgeM3Provider } from '../../ai/providers/bge-m3.provider';

config();

const SAMPLE = `Quy trình ứng dụng công nghệ sinh học để lên men và tinh chế chế phẩm
enzyme dùng trong nông nghiệp. Dây chuyền khép kín, kiểm soát nhiệt độ và pH tự
động, đạt hiệu suất thu hồi trên 85%. Sản phẩm đã được thử nghiệm tại ba tỉnh
đồng bằng sông Cửu Long. Mã sản phẩm NCT-BIO-2024-X7.`;

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });

  const aiService = app.get(AiService);
  const searchService = app.get(SearchService);
  const bge = app.get(BgeM3Provider);

  // Count every call that actually reaches the model.
  let calls = 0;
  const realEmbedHybrid = bge.embedHybrid.bind(bge);
  (bge as unknown as { embedHybrid: unknown }).embedHybrid = (
    ...args: Parameters<BgeM3Provider['embedHybrid']>
  ) => {
    calls++;
    return realEmbedHybrid(...args);
  };

  console.log('--- chunk-embed ---');
  const result = await aiService.chunkEmbed({
    text: SAMPLE,
    referenceId: 'verify-single-embed',
    referenceType: 'intake',
  });
  console.log(`  chunks returned : ${result.chunks.length}`);
  console.log(`  BGE-M3 calls    : ${calls}`);

  const first = result.chunks[0];
  const denseOk =
    Array.isArray(first.embedding) && first.embedding.length === 1024;
  const sparseOk =
    first.sparse &&
    typeof first.sparse === 'object' &&
    Object.keys(first.sparse).length > 0;
  console.log(`  dense 1024-dim  : ${denseOk}`);
  console.log(
    `  sparse present  : ${sparseOk} (${Object.keys(first.sparse ?? {}).length} terms)`,
  );

  console.log('--- indexIntake with those embeddings ---');
  const before = calls;
  // No such intake row exists, so the UPDATE matches nothing — that is fine.
  // What matters is whether the model gets called a second time.
  await searchService.indexIntake(
    '00000000-0000-0000-0000-000000000000',
    result.chunks.map((c) => ({
      index: c.index,
      embedding: c.embedding,
      sparse: c.sparse,
    })),
  );
  console.log(`  BGE-M3 calls after indexIntake : ${calls} (was ${before})`);

  const problems: string[] = [];
  if (calls !== 1) {
    problems.push(
      `expected exactly 1 BGE-M3 call for one intake, got ${calls}`,
    );
  }
  if (!denseOk)
    problems.push('chunk-embed did not return a 1024-dim dense vector');
  if (!sparseOk) problems.push('chunk-embed did not return sparse weights');

  await app.close();

  if (problems.length) {
    console.error('\nFAIL:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log('\nPASS: one intake -> one BGE-M3 forward pass, dense + sparse.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
