import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatsCompositeIndexes1774844348288 implements MigrationInterface {
  name = 'AddStatsCompositeIndexes1774844348288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Composite index for intake stats: covers createdAt range + status group-by
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_intakes_created_at_status"
      ON "intakes" ("created_at", "status")
    `);

    // Composite index for user stats: covers createdAt range + isActive group-by
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_created_at_is_active"
      ON "users" ("created_at", "is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_intakes_created_at_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_users_created_at_is_active"`,
    );
  }
}
