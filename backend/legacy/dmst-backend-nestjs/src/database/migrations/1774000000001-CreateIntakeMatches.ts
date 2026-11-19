import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntakeMatches1774000000001 implements MigrationInterface {
  name = 'CreateIntakeMatches1774000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "intake_matches" (
        "id"                   uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ip_intake_id"         uuid NOT NULL,
        "challenge_intake_id"  uuid NOT NULL,
        "score"                float NOT NULL,
        "matched_chunk"        text NOT NULL,
        "chunk_index"          integer NOT NULL DEFAULT 0,
        "computed_at"          TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"           TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_intake_matches" PRIMARY KEY ("id"),
        CONSTRAINT "FK_intake_matches_ip"
          FOREIGN KEY ("ip_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_intake_matches_challenge"
          FOREIGN KEY ("challenge_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_intake_matches_pair"
        ON "intake_matches" ("ip_intake_id", "challenge_intake_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_intake_matches_ip" ON "intake_matches" ("ip_intake_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_intake_matches_challenge" ON "intake_matches" ("challenge_intake_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "intake_matches"`);
  }
}
