using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261013100000_AddEnterpriseLinkToSellerOffers")]
public partial class AddEnterpriseLinkToSellerOffers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "enterprise_tax_code",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(50)",
            maxLength: 50,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "enterprise_name",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "ix_seller_technology_offers_enterprise_tax_code",
            schema: "technology",
            table: "seller_technology_offers",
            column: "enterprise_tax_code");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "ix_seller_technology_offers_enterprise_tax_code",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "enterprise_tax_code",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "enterprise_name",
            schema: "technology",
            table: "seller_technology_offers");
    }
}
