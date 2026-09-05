/**
 * Shared utilities for intake seed scripts.
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import {
  Intake,
  IntakeType,
  AiProcessingStatus,
  AiChunkingStatus,
} from '../../../intakes/intake.entity';
import { IntakeChunk } from '../../../intakes/intake-chunk.entity';
import { IntakeSector } from '../../../intakes/intake-sector.entity';
import { Sector } from '../../../intakes/sector.entity';
import { User, UserRole } from '../../../users/user.entity';

config();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IntakeSeedData {
  title: string;
  content: string;
  /** Must match sector names in DB (from seed-all.ts SECTOR_SEEDS) */
  sectorNames: string[];
  type?: IntakeType;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BGE_M3_URL = process.env.BGE_M3_URL ?? 'http://localhost:8003';
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 150;

export const SEED_USER_EMAIL = 'seed-intake@sotatek.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SPARSE_DIM = 250002;
const SPARSE_MAX_NNZ = 1000;

export function toSparsevec(sparse: Record<string, number>): string {
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

/** Dense + sparse, via /embed. The old /embed/text returns dense only. */
async function embedChunks(
  chunks: string[],
): Promise<Array<{ dense: number[]; sparse: Record<string, number> }>> {
  if (chunks.length === 0) return [];

  const response = await fetch(`${BGE_M3_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: chunks,
      batch_size: 12,
      return_dense: true,
      return_sparse: true,
      return_colbert: false,
    }),
  });
  if (!response.ok) {
    throw new Error(
      `BGE-M3 error ${response.status}: ${await response.text()}`,
    );
  }
  const data = (await response.json()) as {
    dense: number[][];
    sparse: Array<Record<string, number>> | null;
  };
  return chunks.map((_, i) => ({
    dense: data.dense[i],
    sparse: data.sparse?.[i] ?? {},
  }));
}

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

export function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'dmst_poc',
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    synchronize: false,
    logging: false,
    entities: [__dirname + '/../../../**/*.entity{.ts,.js}'],
  });
}

// ---------------------------------------------------------------------------
// Get or create seed user
// ---------------------------------------------------------------------------

export async function getOrCreateSeedUser(ds: DataSource): Promise<User> {
  const userRepo = ds.getRepository(User);
  let user = await userRepo.findOne({ where: { email: SEED_USER_EMAIL } });
  if (!user) {
    user = await userRepo.save(
      userRepo.create({
        email: SEED_USER_EMAIL,
        password: 'not-used',
        firstName: 'Seed',
        lastName: 'Intake',
        role: UserRole.USER,
        isActive: true,
      }),
    );
    console.log(`  [USER] Created seed user: ${SEED_USER_EMAIL}`);
  }
  return user;
}

// ---------------------------------------------------------------------------
// Core processor
// ---------------------------------------------------------------------------

export interface SeedResult {
  created: number;
  skipped: number;
  chunks: number;
}

export async function processIntakeSeeds(
  ds: DataSource,
  user: User,
  intakes: IntakeSeedData[],
): Promise<SeedResult> {
  const intakeRepo = ds.getRepository(Intake);
  const chunkRepo = ds.getRepository(IntakeChunk);
  const intakeSectorRepo = ds.getRepository(IntakeSector);
  const sectorRepo = ds.getRepository(Sector);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  let created = 0;
  let skipped = 0;
  let totalChunks = 0;

  for (const data of intakes) {
    // Skip if already exists (idempotent)
    const existing = await intakeRepo.findOne({
      where: { title: data.title, userId: user.id },
    });
    if (existing) {
      skipped++;
      continue;
    }

    // Resolve sector entities
    const sectorEntities: Sector[] = [];
    for (const name of data.sectorNames) {
      const sector = await sectorRepo.findOne({ where: { name } });
      if (sector) {
        sectorEntities.push(sector);
      } else {
        console.warn(`  [WARN] Sector not found in DB: "${name}"`);
      }
    }

    // Create intake
    const intake = await intakeRepo.save(
      intakeRepo.create({
        title: data.title,
        aiProcessTitle: data.title,
        content: data.content,
        aiProcessedContent: data.content,
        type: data.type ?? IntakeType.IP,
        userId: user.id,
        aiProcessingStatus: AiProcessingStatus.COMPLETED,
        aiChunkingStatus: AiChunkingStatus.COMPLETED,
      }),
    );

    // Create intake_sectors join rows
    for (const sector of sectorEntities) {
      await intakeSectorRepo.save(
        intakeSectorRepo.create({ intakeId: intake.id, sectorId: sector.id }),
      );
    }

    // Chunk + embed + save
    const plainText = stripHtml(data.content);
    const chunkTexts = await splitter.splitText(plainText);
    const embeddings = await embedChunks(chunkTexts);
    const chunkEntities: IntakeChunk[] = [];

    for (let i = 0; i < chunkTexts.length; i++) {
      const chunk = await chunkRepo.save(
        chunkRepo.create({
          intakeId: intake.id,
          index: i,
          text: chunkTexts[i],
        }),
      );
      chunkEntities.push(chunk);
    }

    // Write vectors in place. There is no separate index to keep in sync any
    // more — the chunk row and its vectors are the same row.
    for (let i = 0; i < chunkEntities.length; i++) {
      await ds.query(
        `UPDATE "intake_chunks"
            SET "emb" = $1::vector, "emb_sparse" = $2::sparsevec
          WHERE "intake_id" = $3 AND "index" = $4`,
        [
          JSON.stringify(embeddings[i].dense),
          toSparsevec(embeddings[i].sparse),
          intake.id,
          chunkEntities[i].index,
        ],
      );
    }

    const sectorNames = sectorEntities.map((s) => s.name);

    created++;
    totalChunks += chunkEntities.length;
    const label = sectorNames.join(' + ');
    console.log(
      `  [OK] ${data.title.substring(0, 55).padEnd(57)} ${chunkEntities.length} chunks  [${label}]`,
    );
  }

  return { created, skipped, chunks: totalChunks };
}

// ---------------------------------------------------------------------------
// Standalone runner helper
// ---------------------------------------------------------------------------

export async function runSectorSeed(
  sectorLabel: string,
  seeds: IntakeSeedData[],
): Promise<void> {
  console.log(`\n=== Seeding: ${sectorLabel} (${seeds.length} intakes) ===\n`);

  const ds = createDataSource();
  await ds.initialize();

  const user = await getOrCreateSeedUser(ds);

  const result = await processIntakeSeeds(ds, user, seeds);

  await ds.destroy();

  console.log(
    `\nDone: created=${result.created}, skipped=${result.skipped}, chunks=${result.chunks}`,
  );
}
