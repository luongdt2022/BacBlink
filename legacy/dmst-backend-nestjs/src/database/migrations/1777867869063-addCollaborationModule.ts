import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCollaborationModule1777867869063 implements MigrationInterface {
  name = 'AddCollaborationModule1777867869063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."collaboration_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "collaboration_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requester_intake_id" uuid NOT NULL, "target_intake_id" uuid NOT NULL, "requester_user_id" uuid NOT NULL, "target_user_id" uuid NOT NULL, "status" "public"."collaboration_requests_status_enum" NOT NULL DEFAULT 'pending', "message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_69423d23da1c2565fbb05da873d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('match_found', 'collaboration_request_received', 'collaboration_request_accepted', 'collaboration_request_rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" ADD CONSTRAINT "FK_f866d5fa3ad8b9dd65dc80b9595" FOREIGN KEY ("requester_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" ADD CONSTRAINT "FK_485914041d5987ad150e797b6f4" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" ADD CONSTRAINT "FK_2a65a2c94ac11e21294c6768553" FOREIGN KEY ("requester_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" ADD CONSTRAINT "FK_0190d89ffcae14f2b5e27088860" FOREIGN KEY ("target_intake_id") REFERENCES "intakes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" DROP CONSTRAINT "FK_0190d89ffcae14f2b5e27088860"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" DROP CONSTRAINT "FK_2a65a2c94ac11e21294c6768553"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" DROP CONSTRAINT "FK_485914041d5987ad150e797b6f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collaboration_requests" DROP CONSTRAINT "FK_f866d5fa3ad8b9dd65dc80b9595"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('match_found')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "collaboration_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."collaboration_requests_status_enum"`,
    );
  }
}
