import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneOrganizationToUsers1774324881187 implements MigrationInterface {
  name = 'AddPhoneOrganizationToUsers1774324881187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "organization" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "organization"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
  }
}
