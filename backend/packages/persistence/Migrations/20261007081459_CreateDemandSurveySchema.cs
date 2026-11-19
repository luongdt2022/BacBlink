using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using NacenTech.Modules.Demand.Domain;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CreateDemandSurveySchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "survey_submissions",
                schema: "demand",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    enterprise_id = table.Column<Guid>(type: "uuid", nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    need_items = table.Column<List<NeedItem>>(type: "jsonb", nullable: false),
                    bottlenecks = table.Column<List<Bottleneck>>(type: "jsonb", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    version = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_survey_submissions", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_survey_submissions_enterprise_id_year",
                schema: "demand",
                table: "survey_submissions",
                columns: new[] { "enterprise_id", "year" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "survey_submissions",
                schema: "demand");
        }
    }
}
