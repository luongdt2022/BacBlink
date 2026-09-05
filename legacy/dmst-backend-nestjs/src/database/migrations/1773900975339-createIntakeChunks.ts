import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntakeChunks1773900975339 implements MigrationInterface {
  name = 'CreateIntakeChunks1773900975339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "intake_chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "intake_id" uuid NOT NULL, "index" integer NOT NULL, "text" text NOT NULL, "embedding" double precision array NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b1073f2d2cf547b134b4e546cbd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_chunks" ADD CONSTRAINT "FK_d5def5a21b1d72ed54f0dc5df1a" FOREIGN KEY ("intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intake_chunks" DROP CONSTRAINT "FK_d5def5a21b1d72ed54f0dc5df1a"`,
    );
    await queryRunner.query(`DROP TABLE "intake_chunks"`);
  }
}
