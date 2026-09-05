import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoriesTable1778000000000 implements MigrationInterface {
  name = 'CreateStoriesTable1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."stories_type_enum" AS ENUM('success', 'failure')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."stories_status_enum" AS ENUM('draft', 'published')`,
    );
    await queryRunner.query(
      `CREATE TABLE "stories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "type" "public"."stories_type_enum" NOT NULL,
        "content" text NOT NULL,
        "lesson" text,
        "status" "public"."stories_status_enum" NOT NULL DEFAULT 'draft',
        "is_hidden" boolean NOT NULL DEFAULT false,
        "author_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bb6f880b260ed96c452b32a39f0" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "stories" ADD CONSTRAINT "FK_stories_author_id" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stories" DROP CONSTRAINT "FK_stories_author_id"`,
    );
    await queryRunner.query(`DROP TABLE "stories"`);
    await queryRunner.query(`DROP TYPE "public"."stories_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."stories_type_enum"`);
  }
}
