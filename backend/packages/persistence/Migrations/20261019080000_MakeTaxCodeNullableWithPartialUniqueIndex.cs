using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261019080000_MakeTaxCodeNullableWithPartialUniqueIndex")]
public partial class MakeTaxCodeNullableWithPartialUniqueIndex : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Chuyển đổi mọi tax_code rỗng sang NULL
        migrationBuilder.Sql("UPDATE enterprise.enterprises SET tax_code = NULL WHERE TRIM(COALESCE(tax_code, '')) = '';");

        // 2. Thêm các cột năng lực nếu chưa tồn tại
        migrationBuilder.Sql(@"
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='enterprise' AND table_name='enterprises' AND column_name='capability_tier') THEN
                    ALTER TABLE enterprise.enterprises ADD COLUMN capability_tier text NOT NULL DEFAULT 'BASIC';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='enterprise' AND table_name='enterprises' AND column_name='is_buyer') THEN
                    ALTER TABLE enterprise.enterprises ADD COLUMN is_buyer boolean NOT NULL DEFAULT false;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='enterprise' AND table_name='enterprises' AND column_name='is_seller') THEN
                    ALTER TABLE enterprise.enterprises ADD COLUMN is_seller boolean NOT NULL DEFAULT false;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='enterprise' AND table_name='enterprises' AND column_name='active_role') THEN
                    ALTER TABLE enterprise.enterprises ADD COLUMN active_role text NOT NULL DEFAULT 'BUYER';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='enterprise' AND table_name='enterprises' AND column_name='owner_person_id') THEN
                    ALTER TABLE enterprise.enterprises ADD COLUMN owner_person_id uuid NULL;
                END IF;
            END $$;
        ");

        // 3. Xóa index cũ nếu có và tạo Partial Unique Index
        migrationBuilder.Sql(@"
            DROP INDEX IF EXISTS enterprise.ix_enterprises_tax_code;
            CREATE UNIQUE INDEX IF NOT EXISTS ix_enterprises_tax_code_unique 
            ON enterprise.enterprises(tax_code) 
            WHERE tax_code IS NOT NULL;

            CREATE INDEX IF NOT EXISTS ix_enterprises_capability_tier 
            ON enterprise.enterprises(capability_tier);

            CREATE INDEX IF NOT EXISTS ix_enterprises_owner_person_id 
            ON enterprise.enterprises(owner_person_id);
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            DROP INDEX IF EXISTS enterprise.ix_enterprises_tax_code_unique;
            DROP INDEX IF EXISTS enterprise.ix_enterprises_capability_tier;
            DROP INDEX IF EXISTS enterprise.ix_enterprises_owner_person_id;
        ");
    }
}
