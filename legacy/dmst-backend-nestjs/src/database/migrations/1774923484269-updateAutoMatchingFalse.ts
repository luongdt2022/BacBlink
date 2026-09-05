import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAutoMatchingFalse1774923484269 implements MigrationInterface {
  name = 'UpdateAutoMatchingFalse1774923484269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_activation_tokens" DROP CONSTRAINT "FK_account_activation_tokens_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ALTER COLUMN "matching_auto" SET DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_activation_tokens" ADD CONSTRAINT "FK_d932c3ad8dfa95df7229094cb33" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_activation_tokens" DROP CONSTRAINT "FK_d932c3ad8dfa95df7229094cb33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ALTER COLUMN "matching_auto" SET DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_activation_tokens" ADD CONSTRAINT "FK_account_activation_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
