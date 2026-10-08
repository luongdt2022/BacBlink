using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CreateEnterpriseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "enterprise");

            migrationBuilder.CreateTable(
                name: "enterprises",
                schema: "enterprise",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_type = table.Column<string>(type: "text", nullable: false),
                    legal_name = table.Column<string>(type: "text", nullable: false),
                    address_info_json = table.Column<string>(type: "jsonb", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    legacy_source_system = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    legacy_source_table = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    legacy_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    legacy_source_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    legacy_migrated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    legacy_mapping_version = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    legacy_batch_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enterprises", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "enterprise_identifiers",
                schema: "enterprise",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enterprise_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enterprise_identifiers", x => x.id);
                    table.ForeignKey(
                        name: "fk_enterprise_identifiers_enterprises_enterprise_id",
                        column: x => x.enterprise_id,
                        principalSchema: "enterprise",
                        principalTable: "enterprises",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enterprise_innovation_projects",
                schema: "enterprise",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enterprise_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enterprise_innovation_projects", x => x.id);
                    table.ForeignKey(
                        name: "fk_enterprise_innovation_projects_enterprises_enterprise_id",
                        column: x => x.enterprise_id,
                        principalSchema: "enterprise",
                        principalTable: "enterprises",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "enterprise_intellectual_properties",
                schema: "enterprise",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enterprise_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    title = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_enterprise_intellectual_properties", x => x.id);
                    table.ForeignKey(
                        name: "fk_enterprise_intellectual_properties_enterprises_enterprise_id",
                        column: x => x.enterprise_id,
                        principalSchema: "enterprise",
                        principalTable: "enterprises",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_enterprise_identifiers_enterprise_id",
                schema: "enterprise",
                table: "enterprise_identifiers",
                column: "enterprise_id");

            migrationBuilder.CreateIndex(
                name: "ix_enterprise_innovation_projects_enterprise_id",
                schema: "enterprise",
                table: "enterprise_innovation_projects",
                column: "enterprise_id");

            migrationBuilder.CreateIndex(
                name: "ix_enterprise_intellectual_properties_enterprise_id",
                schema: "enterprise",
                table: "enterprise_intellectual_properties",
                column: "enterprise_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "enterprise_identifiers",
                schema: "enterprise");

            migrationBuilder.DropTable(
                name: "enterprise_innovation_projects",
                schema: "enterprise");

            migrationBuilder.DropTable(
                name: "enterprise_intellectual_properties",
                schema: "enterprise");

            migrationBuilder.DropTable(
                name: "enterprises",
                schema: "enterprise");
        }
    }
}
