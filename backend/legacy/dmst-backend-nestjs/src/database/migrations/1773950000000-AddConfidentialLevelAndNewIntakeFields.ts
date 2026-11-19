import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfidentialLevelAndNewIntakeFields1773950000000 implements MigrationInterface {
  name = 'AddConfidentialLevelAndNewIntakeFields1773950000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add confidential_level column to intake_attachments
    await queryRunner.query(
      `CREATE TYPE "public"."intake_attachments_confidential_level_enum" AS ENUM('level2', 'level3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_attachments" ADD "confidential_level" "public"."intake_attachments_confidential_level_enum"`,
    );

    // Add status column to intakes
    await queryRunner.query(
      `CREATE TYPE "public"."intakes_status_enum" AS ENUM('draft', 'published')`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" ADD "status" "public"."intakes_status_enum" NOT NULL DEFAULT 'draft'`,
    );

    // Add confidential level 2 & 3 content columns to intakes
    await queryRunner.query(
      `ALTER TABLE "intakes" ADD "confidential_level_2_content" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" ADD "confidential_level_2_ai_processed_content" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" ADD "confidential_level_3_content" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" ADD "confidential_level_3_ai_processed_content" text`,
    );

    // Add profile_picture to file_type enum
    await queryRunner.query(
      `ALTER TYPE "public"."intake_attachments_file_type_enum" RENAME TO "intake_attachments_file_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."intake_attachments_file_type_enum" AS ENUM('image', 'video', 'document', 'profile_picture')`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_attachments" ALTER COLUMN "file_type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_attachments" ALTER COLUMN "file_type" TYPE "public"."intake_attachments_file_type_enum" USING "file_type"::"text"::"public"."intake_attachments_file_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."intake_attachments_file_type_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert file_type enum
    await queryRunner.query(
      `CREATE TYPE "public"."intake_attachments_file_type_enum_old" AS ENUM('image', 'video', 'document')`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_attachments" ALTER COLUMN "file_type" TYPE "public"."intake_attachments_file_type_enum_old" USING "file_type"::"text"::"public"."intake_attachments_file_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "intake_attachments" ALTER COLUMN "file_type" SET DEFAULT 'document'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."intake_attachments_file_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."intake_attachments_file_type_enum_old" RENAME TO "intake_attachments_file_type_enum"`,
    );

    // Drop confidential level columns from intakes
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN "confidential_level_3_ai_processed_content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN "confidential_level_3_content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN "confidential_level_2_ai_processed_content"`,
    );
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP COLUMN "confidential_level_2_content"`,
    );

    // Drop status column from intakes
    await queryRunner.query(`ALTER TABLE "intakes" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."intakes_status_enum"`);

    // Drop confidential_level column from intake_attachments
    await queryRunner.query(
      `ALTER TABLE "intake_attachments" DROP COLUMN "confidential_level"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."intake_attachments_confidential_level_enum"`,
    );
  }
}
