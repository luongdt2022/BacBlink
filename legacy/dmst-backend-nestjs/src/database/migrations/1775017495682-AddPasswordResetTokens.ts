import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetTokens1775017495682 implements MigrationInterface {
  name = 'AddPasswordResetTokens1775017495682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotent: drop old indexes if they exist (may have been dropped already by failed run)
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_intakes_created_at_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_users_created_at_is_active"`,
    );

    // Idempotent: create table only if it doesn't exist (safe for re-runs after partial failure)
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "token" character varying(255) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "consumed_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"),
                CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_password_reset_tokens_user_id" ON "password_reset_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expires_at")`,
    );
    await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'FK_52ac39dd8a28730c63aeb428c9c'
                ) THEN
                    ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_52ac39dd8a28730c63aeb428c9c"
                        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "FK_52ac39dd8a28730c63aeb428c9c"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_password_reset_tokens_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_password_reset_tokens_user_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
    await queryRunner.query(
      `CREATE INDEX "idx_users_created_at_is_active" ON "users" ("is_active", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_intakes_created_at_status" ON "intakes" ("created_at", "status")`,
    );
  }
}
