import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAddSettingUser1774582839344 implements MigrationInterface {
  name = 'FixaddSettingUser1774582839344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_user_settings_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_user_settings_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
