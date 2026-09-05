import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreviousPasswordHashToUsers1774411871166 implements MigrationInterface {
  name = 'AddPreviousPasswordHashToUsers1774411871166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intake_matches" DROP CONSTRAINT "FK_intake_matches_ip"`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_matches" DROP CONSTRAINT "FK_intake_matches_challenge"`,
    );
    await queryRunner.query(`DROP INDEX "public"."UQ_intake_matches_pair"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_intake_matches_ip"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_intake_matches_challenge"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "previous_password_hash" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_matches" ADD CONSTRAINT "FK_c44d5affbe5158b9a08abab3024" FOREIGN KEY ("ip_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_matches" ADD CONSTRAINT "FK_91ba8bd3ba0ab2a8f82e2cb43b8" FOREIGN KEY ("challenge_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intake_matches" DROP CONSTRAINT "FK_91ba8bd3ba0ab2a8f82e2cb43b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_matches" DROP CONSTRAINT "FK_c44d5affbe5158b9a08abab3024"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "previous_password_hash"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_intake_matches_challenge" ON "intake_matches" ("challenge_intake_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_intake_matches_ip" ON "intake_matches" ("ip_intake_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_intake_matches_pair" ON "intake_matches" ("ip_intake_id", "challenge_intake_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_matches" ADD CONSTRAINT "FK_intake_matches_challenge" FOREIGN KEY ("challenge_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_matches" ADD CONSTRAINT "FK_intake_matches_ip" FOREIGN KEY ("ip_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
