using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261030150000_CreateBrokerageTables")]
public sealed class CreateBrokerageTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE SCHEMA IF NOT EXISTS brokerage;

            CREATE TABLE IF NOT EXISTS brokerage.match_candidates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                demand_id UUID,
                demand_code VARCHAR(100),
                demand_title VARCHAR(500),
                buyer_organization_id UUID,
                buyer_organization_name VARCHAR(255),
                offer_id UUID,
                offer_code VARCHAR(100),
                offer_title VARCHAR(500),
                seller_organization_id UUID,
                seller_organization_name VARCHAR(255),
                sector_code VARCHAR(50),
                match_score NUMERIC(5,2),
                tni_score NUMERIC(5,2),
                trl_level INT,
                ip_status VARCHAR(100),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS brokerage.connection_requests (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                request_code VARCHAR(50) NOT NULL,
                sender_user_id UUID,
                sender_org_name VARCHAR(255),
                sender_role VARCHAR(50) DEFAULT 'BUYER',
                receiver_user_id UUID,
                receiver_org_name VARCHAR(255),
                demand_id UUID,
                offer_id UUID,
                message TEXT,
                proposed_budget_range VARCHAR(100),
                status VARCHAR(50) DEFAULT 'PENDING',
                response_note TEXT,
                responded_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT now(),
                target_offer_id UUID,
                buyer_organization_id UUID,
                seller_organization_id UUID,
                rejection_reason TEXT,
                sla_deadline TIMESTAMPTZ DEFAULT (now() + INTERVAL '48 hours')
            );

            CREATE TABLE IF NOT EXISTS brokerage.opportunities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                opportunity_code VARCHAR(50) NOT NULL,
                connection_request_id UUID,
                title VARCHAR(500),
                buyer_org_name VARCHAR(255),
                buyer_contact_name VARCHAR(255),
                buyer_contact_phone VARCHAR(50),
                buyer_contact_email VARCHAR(255),
                seller_org_name VARCHAR(255),
                seller_contact_name VARCHAR(255),
                seller_contact_phone VARCHAR(50),
                seller_contact_email VARCHAR(255),
                assigned_expert_name VARCHAR(255),
                managing_authority_id VARCHAR(50),
                stage VARCHAR(50) DEFAULT 'INITIATED',
                estimated_value_million_vnd NUMERIC(18,2) DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT now(),
                updated_at TIMESTAMPTZ DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS brokerage.deal_discussions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                opportunity_id UUID NOT NULL,
                sender_name VARCHAR(255),
                sender_role VARCHAR(50),
                message TEXT,
                attachment_url TEXT,
                created_at TIMESTAMPTZ DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS brokerage.mou_agreements (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                mou_code VARCHAR(50) NOT NULL,
                opportunity_id UUID NOT NULL,
                scope_of_work TEXT,
                pilot_duration_months INT,
                commercial_terms TEXT,
                intellectual_property_terms TEXT,
                status VARCHAR(50) DEFAULT 'DRAFT',
                signed_date TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT now()
            );

            CREATE INDEX IF NOT EXISTS idx_conn_requests_seller_status ON brokerage.connection_requests(seller_organization_id, status);
            CREATE INDEX IF NOT EXISTS idx_conn_requests_buyer_status ON brokerage.connection_requests(buyer_organization_id, status);
            CREATE INDEX IF NOT EXISTS idx_conn_requests_target_offer_id ON brokerage.connection_requests(target_offer_id);
            CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON brokerage.opportunities(stage);
            CREATE INDEX IF NOT EXISTS idx_opportunities_conn_req ON brokerage.opportunities(connection_request_id);
            CREATE INDEX IF NOT EXISTS idx_deal_discussions_opp ON brokerage.deal_discussions(opportunity_id);
            CREATE INDEX IF NOT EXISTS idx_mou_agreements_opp ON brokerage.mou_agreements(opportunity_id);
        """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DROP TABLE IF EXISTS brokerage.mou_agreements;
            DROP TABLE IF EXISTS brokerage.deal_discussions;
            DROP TABLE IF EXISTS brokerage.opportunities;
            DROP TABLE IF EXISTS brokerage.connection_requests;
            DROP TABLE IF EXISTS brokerage.match_candidates;
        """);
    }
}
