import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAiChunkingStatus1773889953996 implements MigrationInterface {
  name = 'AddAiChunkingStatus1773889953996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const enumExists = await queryRunner.query(
      `SELECT 1 FROM pg_type WHERE typname = 'intakes_ai_chunking_status_enum' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')`,
    );
    if (!enumExists.length) {
      await queryRunner.query(
        `CREATE TYPE "public"."intakes_ai_chunking_status_enum" AS ENUM('processing', 'completed', 'failed')`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "intakes" ADD "ai_chunking_status" "public"."intakes_ai_chunking_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN "ai_chunking_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."intakes_ai_chunking_status_enum"`,
    );
  }
}
