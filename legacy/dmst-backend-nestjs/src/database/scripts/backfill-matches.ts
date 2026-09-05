/**
 * Recomputes intake_matches for every intake that has finished chunking.
 *
 * This used to carry its own copy of the hybrid-search query against
 * Elasticsearch. It now boots the Nest application context and calls
 * IntakesService.computeMatches, so there is exactly one implementation of
 * retrieval in the codebase — the one that pushes hard filters into the query
 * and fuses channels with RRF.
 *
 * Needs the same environment the API needs (Postgres, Redis, BGE-M3).
 *
 *   npm run backfill:matches
 */
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../../app.module';
import { Intake, AiChunkingStatus } from '../../intakes/intake.entity';
import { IntakesService } from '../../intakes/intakes.service';

config();

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const logger = new Logger('BackfillMatches');
  const intakesService = app.get(IntakesService);
  const intakeRepo = app.get<Repository<Intake>>(getRepositoryToken(Intake));

  const intakes = await intakeRepo.find({
    where: { aiChunkingStatus: AiChunkingStatus.COMPLETED },
    select: ['id', 'title', 'type'],
  });

  logger.log(`Backfilling matches for ${intakes.length} intakes`);

  let computed = 0;
  let empty = 0;
  let failed = 0;

  for (const intake of intakes) {
    try {
      const n = await intakesService.computeMatches(intake.id);
      if (n > 0) computed++;
      else empty++;
    } catch (err) {
      // One bad intake must not abandon the run.
      failed++;
      logger.error(
        `intake ${intake.id} (${intake.title.slice(0, 40)}): ${String(err)}`,
      );
    }
    process.stdout.write(
      `\r  ${computed + empty + failed}/${intakes.length}  matched=${computed} empty=${empty} failed=${failed}   `,
    );
  }

  process.stdout.write('\n');
  logger.log(`Done. matched=${computed} empty=${empty} failed=${failed}`);

  await app.close();
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
