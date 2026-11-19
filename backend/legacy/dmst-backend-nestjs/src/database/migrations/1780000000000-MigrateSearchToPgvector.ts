import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Moves hybrid search off Elasticsearch and into PostgreSQL.
 *
 * Four retrieval channels replace the previous knn + BM25 pair:
 *   dense   — pgvector HNSW over the BGE-M3 embedding
 *   sparse  — BGE-M3 lexical weights, the channel that carries Vietnamese word
 *             segmentation (its SentencePiece tokenizer does not depend on
 *             whitespace, which neither to_tsvector nor Elasticsearch's
 *             standard analyzer can do — both only split syllables)
 *   lexical — tsvector, one accented and one unaccented, queried with
 *             phraseto_tsquery so ordered syllables behave like phrases
 *   trigram — pg_trgm for patent numbers, product codes and misspellings
 *
 * The old `embedding` double precision[] column is KEPT. It is the rollback
 * path: nothing here is destructive, and a follow-up migration drops it once
 * the new path has run in production.
 */
export class MigrateSearchToPgvector1780000000000 implements MigrationInterface {
  name = 'MigrateSearchToPgvector1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS unaccent`);

    // unaccent() is STABLE, not IMMUTABLE, so it cannot be used directly in a
    // generated column or an index expression. Pinning the dictionary makes the
    // wrapper safe to mark IMMUTABLE.
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION f_unaccent(text) RETURNS text AS
      $$ SELECT public.unaccent('public.unaccent', $1) $$
      LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    `);

    await queryRunner.query(`
      ALTER TABLE "intake_chunks"
        ADD COLUMN IF NOT EXISTS "emb" vector(1024),
        ADD COLUMN IF NOT EXISTS "emb_sparse" sparsevec(250002)
    `);

    // `embedding` is legacy from here on, so it must stop being mandatory:
    // writers that only populate `emb`/`emb_sparse` would otherwise hit a
    // not-null violation on insert.
    await queryRunner.query(
      `ALTER TABLE "intake_chunks" ALTER COLUMN "embedding" DROP NOT NULL`,
    );

    // Two lexical fields, not one normalised field: unaccenting in one
    // direction would destroy the ability to tell accented words apart.
    await queryRunner.query(`
      ALTER TABLE "intake_chunks"
        ADD COLUMN IF NOT EXISTS "tsv" tsvector
          GENERATED ALWAYS AS (to_tsvector('simple', "text")) STORED,
        ADD COLUMN IF NOT EXISTS "tsv_ua" tsvector
          GENERATED ALWAYS AS (to_tsvector('simple', f_unaccent("text"))) STORED,
        ADD COLUMN IF NOT EXISTS "searchable_ua" text
          GENERATED ALWAYS AS (f_unaccent("text")) STORED
    `);

    // Backfill dense vectors from the existing double precision[] column.
    // Sparse vectors cannot be backfilled here — they require re-embedding,
    // which `npm run reindex:pg` does.
    await queryRunner.query(`
      UPDATE "intake_chunks"
         SET "emb" = "embedding"::vector
       WHERE "embedding" IS NOT NULL
         AND array_length("embedding", 1) = 1024
         AND "emb" IS NULL
    `);

    await queryRunner.query(`SET maintenance_work_mem = '1GB'`);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_intake_chunks_emb_hnsw"
         ON "intake_chunks" USING hnsw ("emb" vector_cosine_ops)`,
    );
    // pgvector indexes a sparsevec with at most 1000 non-zero elements; the
    // application truncates to that before writing.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_intake_chunks_sparse_hnsw"
         ON "intake_chunks" USING hnsw ("emb_sparse" sparsevec_ip_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_intake_chunks_tsv"
         ON "intake_chunks" USING gin ("tsv")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_intake_chunks_tsv_ua"
         ON "intake_chunks" USING gin ("tsv_ua")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_intake_chunks_trgm"
         ON "intake_chunks" USING gin ("searchable_ua" gin_trgm_ops)`,
    );
    // Supports the hard filter that now runs before top-K instead of after it.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_intakes_status_type_user"
         ON "intakes" ("status", "type", "user_id")`,
    );

    await queryRunner.query(`ANALYZE "intake_chunks"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_intakes_status_type_user"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_intake_chunks_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_intake_chunks_tsv_ua"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_intake_chunks_tsv"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_intake_chunks_sparse_hnsw"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_intake_chunks_emb_hnsw"`,
    );

    await queryRunner.query(`
      ALTER TABLE "intake_chunks"
        DROP COLUMN IF EXISTS "searchable_ua",
        DROP COLUMN IF EXISTS "tsv_ua",
        DROP COLUMN IF EXISTS "tsv",
        DROP COLUMN IF EXISTS "emb_sparse",
        DROP COLUMN IF EXISTS "emb"
    `);

    // Only restorable when no row has a null embedding; rows written after the
    // migration legitimately have none, so leave the constraint off rather than
    // fail the rollback.
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_unaccent(text)`);
    // Extensions are left in place: other objects may depend on them and
    // dropping them is not required to undo this migration.
  }
}
