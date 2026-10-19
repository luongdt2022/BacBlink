using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261019180000_AddDeltaV6SellerOfferTier2Tier4AndSpecCategory")]
public partial class AddDeltaV6SellerOfferTier2Tier4AndSpecCategory : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Mở rộng seller_technology_offers: Lớp 2, Lớp 4, Pháp lý
        migrationBuilder.AddColumn<string>(
            name: "model_code",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "manufacturer",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "origin_country",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "equipment_status",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(50)",
            maxLength: 50,
            nullable: false,
            defaultValue: "NEW");

        migrationBuilder.AddColumn<int>(
            name: "manufacturing_year",
            schema: "technology",
            table: "seller_technology_offers",
            type: "integer",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "capacity_scale",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "energy_consumption",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "automation_level",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "operating_principle",
            schema: "technology",
            table: "seller_technology_offers",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "deployment_conditions",
            schema: "technology",
            table: "seller_technology_offers",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "transfer_priority_method",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "price_includes",
            schema: "technology",
            table: "seller_technology_offers",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "tax_and_extra_costs",
            schema: "technology",
            table: "seller_technology_offers",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "technical_support_method",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<DateOnly>(
            name: "ip_issue_date",
            schema: "technology",
            table: "seller_technology_offers",
            type: "date",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "legal_commitment_confirmed",
            schema: "technology",
            table: "seller_technology_offers",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        // 2. Mở rộng offer_spec_values: spec_category
        migrationBuilder.AddColumn<string>(
            name: "spec_category",
            schema: "technology",
            table: "offer_spec_values",
            type: "character varying(50)",
            maxLength: 50,
            nullable: false,
            defaultValue: "TIER_3_CUSTOM");

        migrationBuilder.CreateIndex(
            name: "idx_offer_spec_category",
            schema: "technology",
            table: "offer_spec_values",
            columns: new[] { "offer_id", "spec_category" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "idx_offer_spec_category",
            schema: "technology",
            table: "offer_spec_values");

        migrationBuilder.DropColumn(
            name: "spec_category",
            schema: "technology",
            table: "offer_spec_values");

        migrationBuilder.DropColumn(
            name: "legal_commitment_confirmed",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "ip_issue_date",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "technical_support_method",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "tax_and_extra_costs",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "price_includes",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "transfer_priority_method",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "deployment_conditions",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "operating_principle",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "automation_level",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "energy_consumption",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "capacity_scale",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "manufacturing_year",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "equipment_status",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "origin_country",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "manufacturer",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "model_code",
            schema: "technology",
            table: "seller_technology_offers");
    }
}
