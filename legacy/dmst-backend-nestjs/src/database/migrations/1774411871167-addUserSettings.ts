import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSettings1774411871167 implements MigrationInterface {
  name = 'AddUserSettings1774411871167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'user_settings'
    `);
    if (tableExists.length > 0) return;

    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id"            UUID        NOT NULL DEFAULT gen_random_uuid(),
        "user_id"       UUID        NOT NULL,
        "matching_auto" BOOLEAN     NOT NULL DEFAULT true,
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_settings_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_user_settings_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_settings"`);
  }
}
