import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivationTokens1774500000000 implements MigrationInterface {
  name = 'CreateActivationTokens1774500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "account_activation_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "token" character varying(255) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "consumed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_account_activation_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_account_activation_tokens_token" UNIQUE ("token"),
        CONSTRAINT "FK_account_activation_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_account_activation_tokens_user_id" ON "account_activation_tokens" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_account_activation_tokens_expires_at" ON "account_activation_tokens" ("expires_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_account_activation_tokens_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_account_activation_tokens_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "account_activation_tokens"`);
  }
}
