import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyEntities1773992917514 implements MigrationInterface {
  name = 'RemoveLegacyEntities1773992917514';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "intakes" DROP COLUMN "sector_ids"`);

    // Drop legacy tables in reverse order of dependencies
    await queryRunner.query(`DROP TABLE IF EXISTS "ip_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ip_attachments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ips"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "challenge_attachments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "challenges"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "experts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "owners"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "research_fields"`);

    // Drop legacy enums if they exist
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."challenges_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."challenges_reject_reason_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intakes" ADD "sector_ids" text array`,
    );
  }
}
