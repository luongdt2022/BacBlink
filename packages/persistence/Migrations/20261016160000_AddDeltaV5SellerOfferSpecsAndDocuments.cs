using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261016160000_AddDeltaV5SellerOfferSpecsAndDocuments")]
public partial class AddDeltaV5SellerOfferSpecsAndDocuments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1. Mở rộng seller_technology_offers
        migrationBuilder.AddColumn<string>(
            name: "main_image_url",
            schema: "technology",
            table: "seller_technology_offers",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<string[]>(
            name: "gallery_image_urls",
            schema: "technology",
            table: "seller_technology_offers",
            type: "text[]",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "delivery_timeline",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "warranty_terms",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "supply_scope",
            schema: "technology",
            table: "seller_technology_offers",
            type: "character varying(255)",
            maxLength: 255,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "payment_terms",
            schema: "technology",
            table: "seller_technology_offers",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "installation_support",
            schema: "technology",
            table: "seller_technology_offers",
            type: "boolean",
            nullable: false,
            defaultValue: true);

        // 2. Tạo bảng offer_spec_values
        migrationBuilder.CreateTable(
            name: "offer_spec_values",
            schema: "technology",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                offer_id = table.Column<Guid>(type: "uuid", nullable: false),
                spec_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                spec_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                spec_value = table.Column<string>(type: "text", nullable: false),
                unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "clock_timestamp()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_offer_spec_values", x => x.id);
                table.ForeignKey(
                    name: "fk_offer_spec_values_seller_technology_offers_offer_id",
                    column: x => x.offer_id,
                    principalSchema: "technology",
                    principalTable: "seller_technology_offers",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_offer_spec_values_offer_id",
            schema: "technology",
            table: "offer_spec_values",
            column: "offer_id");

        migrationBuilder.CreateIndex(
            name: "ix_offer_spec_values_spec_code",
            schema: "technology",
            table: "offer_spec_values",
            column: "spec_code");

        // 3. Tạo bảng offer_documents
        migrationBuilder.CreateTable(
            name: "offer_documents",
            schema: "technology",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                offer_id = table.Column<Guid>(type: "uuid", nullable: false),
                document_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                file_url = table.Column<string>(type: "text", nullable: false),
                file_size_bytes = table.Column<long>(type: "bigint", nullable: false),
                access_scope = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "AFTER_CONNECTION"),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "clock_timestamp()")
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_offer_documents", x => x.id);
                table.ForeignKey(
                    name: "fk_offer_documents_seller_technology_offers_offer_id",
                    column: x => x.offer_id,
                    principalSchema: "technology",
                    principalTable: "seller_technology_offers",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "ix_offer_documents_offer_id",
            schema: "technology",
            table: "offer_documents",
            column: "offer_id");

        migrationBuilder.CreateIndex(
            name: "ix_offer_documents_document_type",
            schema: "technology",
            table: "offer_documents",
            column: "document_type");

        migrationBuilder.CreateIndex(
            name: "ix_offer_documents_access_scope",
            schema: "technology",
            table: "offer_documents",
            column: "access_scope");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "offer_documents",
            schema: "technology");

        migrationBuilder.DropTable(
            name: "offer_spec_values",
            schema: "technology");

        migrationBuilder.DropColumn(
            name: "main_image_url",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "gallery_image_urls",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "delivery_timeline",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "warranty_terms",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "supply_scope",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "payment_terms",
            schema: "technology",
            table: "seller_technology_offers");

        migrationBuilder.DropColumn(
            name: "installation_support",
            schema: "technology",
            table: "seller_technology_offers");
    }
}
