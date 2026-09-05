import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategories1774500000000 implements MigrationInterface {
  name = 'CreateCategories1774500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id"        uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name"      varchar(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "intakes"
      ADD COLUMN "category_id" uuid NULL,
      ADD CONSTRAINT "FK_intakes_category"
        FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      INSERT INTO "categories" ("name") VALUES
        ('Công nghệ thông tin'),
        ('Nông nghiệp & Thực phẩm'),
        ('Y tế & Dược phẩm'),
        ('Năng lượng & Môi trường'),
        ('Công nghiệp & Chế tạo'),
        ('Giáo dục & Đào tạo')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "intakes" DROP CONSTRAINT "FK_intakes_category"`,
    );
    await queryRunner.query(`ALTER TABLE "intakes" DROP COLUMN "category_id"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
