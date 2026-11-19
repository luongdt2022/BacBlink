using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261010190000_AddDemandSurveysSellerOffersAndAssessments")]
public sealed class AddDemandSurveysSellerOffersAndAssessments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // -------------------------------------------------------------
        // 1. Schema: demand -> demand_surveys & demand_items (TASK-03)
        // -------------------------------------------------------------
        migrationBuilder.CreateTable(
            name: "demand_surveys",
            schema: "demand",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                survey_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                survey_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                company_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                tax_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                contact_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                contact_phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                contact_email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                business_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                enterprise_size = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                employee_scale = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                revenue_range_3y = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                top_bottlenecks = table.Column<List<string>>(type: "text[]", nullable: false),
                organization_id = table.Column<Guid>(type: "uuid", nullable: true),
                status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                submitted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                created_by = table.Column<Guid>(type: "uuid", nullable: true),
                version = table.Column<int>(type: "integer", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_demand_surveys", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_demand_surveys_survey_code",
            schema: "demand",
            table: "demand_surveys",
            column: "survey_code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_demand_surveys_tax_code",
            schema: "demand",
            table: "demand_surveys",
            column: "tax_code");

        migrationBuilder.CreateIndex(
            name: "ix_demand_surveys_status",
            schema: "demand",
            table: "demand_surveys",
            column: "status");

        migrationBuilder.CreateTable(
            name: "demand_items",
            schema: "demand",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                survey_id = table.Column<Guid>(type: "uuid", nullable: true),
                item_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                stage_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                technical_problem = table.Column<string>(type: "text", nullable: false),
                desired_solution = table.Column<string>(type: "text", nullable: true),
                need_consulting = table.Column<bool>(type: "boolean", nullable: false),
                expected_goal = table.Column<string>(type: "text", nullable: false),
                application_scale = table.Column<string>(type: "text", nullable: true),
                sector_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                tech_group_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                demand_type_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                budget_range = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                urgency_score = table.Column<int>(type: "integer", nullable: false),
                impact_score = table.Column<int>(type: "integer", nullable: false),
                investment_capacity = table.Column<int>(type: "integer", nullable: false),
                adoption_readiness = table.Column<int>(type: "integer", nullable: false),
                tni_score = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                tni_classification = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                is_public_listed = table.Column<bool>(type: "boolean", nullable: false),
                created_by = table.Column<Guid>(type: "uuid", nullable: true),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_demand_items", x => x.id);
                table.ForeignKey(
                    name: "fk_demand_items_demand_surveys_survey_id",
                    column: x => x.survey_id,
                    principalSchema: "demand",
                    principalTable: "demand_surveys",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_demand_items_item_code",
            schema: "demand",
            table: "demand_items",
            column: "item_code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_demand_items_survey_id",
            schema: "demand",
            table: "demand_items",
            column: "survey_id");

        migrationBuilder.CreateIndex(
            name: "ix_demand_items_sector_code",
            schema: "demand",
            table: "demand_items",
            column: "sector_code");

        migrationBuilder.CreateIndex(
            name: "ix_demand_items_status",
            schema: "demand",
            table: "demand_items",
            column: "status");

        migrationBuilder.CreateIndex(
            name: "ix_demand_items_is_public_listed",
            schema: "demand",
            table: "demand_items",
            column: "is_public_listed");

        // -------------------------------------------------------------
        // 2. Schema: technology -> seller_technology_offers (TASK-04)
        // -------------------------------------------------------------
        migrationBuilder.CreateTable(
            name: "seller_technology_offers",
            schema: "technology",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                offer_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                offer_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                has_tech_transfer = table.Column<bool>(type: "boolean", nullable: false),
                title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                summary = table.Column<string>(type: "text", nullable: false),
                problem_solved = table.Column<string>(type: "text", nullable: false),
                sector_code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                sector_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                pricing_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                price_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                price_min = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                price_max = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                developer_origin = table.Column<string>(type: "text", nullable: true),
                trl_level = table.Column<int>(type: "integer", nullable: true),
                ip_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                ip_registration_number = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                transfer_method = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                commercial_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                contact_point_role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                successful_connections = table.Column<int>(type: "integer", nullable: false),
                rating_score = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                review_count = table.Column<int>(type: "integer", nullable: false),
                managing_authority_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                managing_authority_name = table.Column<string>(type: "text", nullable: true),
                scope_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                scope_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                legal_consent = table.Column<bool>(type: "boolean", nullable: false),
                created_by = table.Column<Guid>(type: "uuid", nullable: true),
                published_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                version = table.Column<int>(type: "integer", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_seller_technology_offers", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_seller_technology_offers_offer_code",
            schema: "technology",
            table: "seller_technology_offers",
            column: "offer_code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_seller_technology_offers_sector_code",
            schema: "technology",
            table: "seller_technology_offers",
            column: "sector_code");

        migrationBuilder.CreateIndex(
            name: "ix_seller_technology_offers_status",
            schema: "technology",
            table: "seller_technology_offers",
            column: "status");

        migrationBuilder.CreateIndex(
            name: "ix_seller_technology_offers_managing_authority_id",
            schema: "technology",
            table: "seller_technology_offers",
            column: "managing_authority_id");

        // -------------------------------------------------------------
        // 3. Schema: assessment -> tt17_assessments (TASK-09)
        // -------------------------------------------------------------
        migrationBuilder.EnsureSchema(name: "assessment");

        migrationBuilder.CreateTable(
            name: "tt17_assessments",
            schema: "assessment",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                enterprise_id = table.Column<Guid>(type: "uuid", nullable: false),
                assessment_year = table.Column<int>(type: "integer", nullable: false),
                scope_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                machineries = table.Column<string>(type: "jsonb", nullable: true),
                equipments = table.Column<string>(type: "jsonb", nullable: true),
                materials = table.Column<string>(type: "jsonb", nullable: true),
                criteria = table.Column<string>(type: "jsonb", nullable: true),
                total_score = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                classification = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                version = table.Column<int>(type: "integer", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_tt17_assessments", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_tt17_assessments_enterprise_id_assessment_year",
            schema: "assessment",
            table: "tt17_assessments",
            columns: new[] { "enterprise_id", "assessment_year" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "tt17_assessments", schema: "assessment");
        migrationBuilder.DropTable(name: "seller_technology_offers", schema: "technology");
        migrationBuilder.DropTable(name: "demand_items", schema: "demand");
        migrationBuilder.DropTable(name: "demand_surveys", schema: "demand");
    }
}
