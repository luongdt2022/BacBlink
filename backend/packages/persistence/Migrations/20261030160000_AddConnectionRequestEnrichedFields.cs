using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261030160000_AddConnectionRequestEnrichedFields")]
public sealed class AddConnectionRequestEnrichedFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'brokerage' AND table_name = 'connection_requests'
                ) THEN
                    ALTER TABLE brokerage.connection_requests
                        ADD COLUMN IF NOT EXISTS target_offer_id uuid,
                        ADD COLUMN IF NOT EXISTS buyer_organization_id uuid,
                        ADD COLUMN IF NOT EXISTS seller_organization_id uuid,
                        ADD COLUMN IF NOT EXISTS rejection_reason text,
                        ADD COLUMN IF NOT EXISTS sla_deadline timestamp with time zone DEFAULT (now() + INTERVAL '48 hours');

                    UPDATE brokerage.connection_requests
                    SET target_offer_id = offer_id
                    WHERE target_offer_id IS NULL AND offer_id IS NOT NULL;

                    UPDATE brokerage.connection_requests
                    SET sla_deadline = created_at + INTERVAL '48 hours'
                    WHERE sla_deadline IS NULL;

                    CREATE INDEX IF NOT EXISTS idx_conn_requests_seller_status 
                        ON brokerage.connection_requests(seller_organization_id, status);

                    CREATE INDEX IF NOT EXISTS idx_conn_requests_buyer_status 
                        ON brokerage.connection_requests(buyer_organization_id, status);

                    CREATE INDEX IF NOT EXISTS idx_conn_requests_target_offer_id 
                        ON brokerage.connection_requests(target_offer_id);
                END IF;
            END $$;
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_schema = 'brokerage' AND table_name = 'connection_requests'
                ) THEN
                    DROP INDEX IF EXISTS brokerage.idx_conn_requests_target_offer_id;
                    DROP INDEX IF EXISTS brokerage.idx_conn_requests_buyer_status;
                    DROP INDEX IF EXISTS brokerage.idx_conn_requests_seller_status;

                    ALTER TABLE brokerage.connection_requests
                        DROP COLUMN IF EXISTS target_offer_id,
                        DROP COLUMN IF EXISTS buyer_organization_id,
                        DROP COLUMN IF EXISTS seller_organization_id,
                        DROP COLUMN IF EXISTS rejection_reason,
                        DROP COLUMN IF EXISTS sla_deadline;
                END IF;
            END $$;
        """);
    }
}
