using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CreateExpertProfileAndEvidenceSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "expert_profiles",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: true),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    birth_year = table.Column<int>(type: "integer", nullable: false),
                    gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    id_card_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    id_card_date = table.Column<DateOnly>(type: "date", nullable: false),
                    academic_rank = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    academic_rank_year = table.Column<int>(type: "integer", nullable: true),
                    degree = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    degree_year = table.Column<int>(type: "integer", nullable: false),
                    organization_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    organization_address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    research_title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    position_title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    expertise_sectors = table.Column<string[]>(type: "text[]", nullable: false),
                    mastered_tech_codes = table.Column<string[]>(type: "text[]", nullable: false),
                    training_history_json = table.Column<string>(type: "jsonb", nullable: true),
                    employment_history_json = table.Column<string>(type: "jsonb", nullable: true),
                    publications_json = table.Column<string>(type: "jsonb", nullable: true),
                    consulting_summary = table.Column<string>(type: "text", nullable: true),
                    cv_file_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_project_leader = table.Column<bool>(type: "boolean", nullable: false),
                    is_main_contributor = table.Column<bool>(type: "boolean", nullable: false),
                    pdpd_consent_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    legal_oath = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    draft_source = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "PORTAL"),
                    magic_link_token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    magic_link_expires_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    reviewer_note = table.Column<string>(type: "text", nullable: true),
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
                    table.PrimaryKey("pk_expert_profiles", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_expert_profiles_magic_link_token",
                schema: "brokerage",
                table: "expert_profiles",
                column: "magic_link_token");

            migrationBuilder.CreateIndex(
                name: "ix_expert_profiles_person_id",
                schema: "brokerage",
                table: "expert_profiles",
                column: "person_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_expert_profiles_status",
                schema: "brokerage",
                table: "expert_profiles",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "expert_profiles",
                schema: "brokerage");

        }
    }
}
