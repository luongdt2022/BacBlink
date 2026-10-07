using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261005130000_AddCodeAndMetadataToTaxonomyTerms")]
public partial class AddCodeAndMetadataToTaxonomyTerms : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "code",
            schema: "policy",
            table: "taxonomy_terms",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "metadata",
            schema: "policy",
            table: "taxonomy_terms",
            type: "jsonb",
            nullable: false,
            defaultValue: "{}");

        migrationBuilder.CreateIndex(
            name: "uq_taxonomy_terms_kind_code",
            schema: "policy",
            table: "taxonomy_terms",
            columns: new[] { "kind", "code" },
            unique: true,
            filter: "code IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "ix_taxonomy_terms_code",
            schema: "policy",
            table: "taxonomy_terms",
            column: "code");

        // Seed 10 Lĩnh vực chuẩn xác thực từ Excel (LV01..LV17)
        migrationBuilder.Sql(@"
            DO $SEED$
            BEGIN
                -- 1. Nông nghiệp (LV01)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV01') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV01', 'Nông nghiệp', true, '{""tt17Code"":""Liên ngành"",""matrixPairsCount"":8}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 2. Chế biến thực phẩm – đồ uống (LV05)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV05') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV05', 'Chế biến thực phẩm – đồ uống', true, '{""tt17Code"":""C.10, C.11"",""matrixPairsCount"":8}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 3. Cơ khí – chế tạo – công nghiệp hỗ trợ (LV07)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV07') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV07', 'Cơ khí – chế tạo – công nghiệp hỗ trợ', true, '{""tt17Code"":""C.32"",""matrixPairsCount"":6}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 4. Điện – điện tử – tự động hóa (LV08)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV08') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV08', 'Điện – điện tử – tự động hóa', true, '{""tt17Code"":""C.26, C.27"",""matrixPairsCount"":6}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 5. Nước – môi trường – chất thải (LV11)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV11') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV11', 'Nước – môi trường – chất thải', true, '{""tt17Code"":""E.38"",""matrixPairsCount"":6}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 6. Xây dựng – vật liệu – hạ tầng (LV12)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV12') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV12', 'Xây dựng – vật liệu – hạ tầng', true, '{""tt17Code"":""C.23"",""matrixPairsCount"":3}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 7. Logistics – vận tải – kho bãi (LV14)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV14') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV14', 'Logistics – vận tải – kho bãi', true, '{""tt17Code"":""H.52"",""matrixPairsCount"":4}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 8. Du lịch – khách sạn – nhà hàng (LV15)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV15') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV15', 'Du lịch – khách sạn – nhà hàng', true, '{""tt17Code"":""Dịch vụ"",""matrixPairsCount"":4}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 9. CNTT – viễn thông – chuyển đổi số (LV16)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV16') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV16', 'CNTT – viễn thông – chuyển đổi số', true, '{""tt17Code"":""Công nghệ số"",""matrixPairsCount"":8}'::jsonb, 1, NOW(), NOW());
                END IF;

                -- 10. Khoa học – công nghệ – đổi mới sáng tạo (LV17)
                IF NOT EXISTS (SELECT 1 FROM policy.taxonomy_terms WHERE kind = 'SECTOR' AND code = 'LV17') THEN
                    INSERT INTO policy.taxonomy_terms (id, kind, code, name, is_active, metadata, version, created_at, updated_at)
                    VALUES (gen_random_uuid(), 'SECTOR', 'LV17', 'Khoa học – công nghệ – đổi mới sáng tạo', true, '{""tt17Code"":""M.72"",""matrixPairsCount"":6}'::jsonb, 1, NOW(), NOW());
                END IF;
            END $SEED$;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_taxonomy_terms_code",
            schema: "policy",
            table: "taxonomy_terms");

        migrationBuilder.DropIndex(
            name: "uq_taxonomy_terms_kind_code",
            schema: "policy",
            table: "taxonomy_terms");

        migrationBuilder.DropColumn(
            name: "metadata",
            schema: "policy",
            table: "taxonomy_terms");

        migrationBuilder.DropColumn(
            name: "code",
            schema: "policy",
            table: "taxonomy_terms");
    }
}
