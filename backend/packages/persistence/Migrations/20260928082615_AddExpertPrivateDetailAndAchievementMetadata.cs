using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExpertPrivateDetailAndAchievementMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "budget_amount",
                schema: "brokerage",
                table: "expert_research_projects",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "end_year",
                schema: "brokerage",
                table: "expert_research_projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "lead_organization",
                schema: "brokerage",
                table: "expert_research_projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "partner_organization",
                schema: "brokerage",
                table: "expert_research_projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "start_year",
                schema: "brokerage",
                table: "expert_research_projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "completion_year",
                schema: "brokerage",
                table: "expert_practical_projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "outcome",
                schema: "brokerage",
                table: "expert_practical_projects",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description",
                schema: "brokerage",
                table: "expert_patents",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "granted_at",
                schema: "brokerage",
                table: "expert_patents",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "technology_readiness_level",
                schema: "brokerage",
                table: "expert_patents",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "award_level",
                schema: "brokerage",
                table: "expert_awards",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description",
                schema: "brokerage",
                table: "expert_awards",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "expert_profile_private_details",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    residential_address_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    bank_account_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    bank_name_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    minimum_consulting_fee_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    organization_leader_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    organization_leader_phone_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    assistant_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    council_and_certificates_ciphertext = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_profile_private_details", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_profile_private_details_expert_profiles_expert_profi~",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_expert_profile_private_details_expert_profile_id",
                schema: "brokerage",
                table: "expert_profile_private_details",
                column: "expert_profile_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "expert_profile_private_details",
                schema: "brokerage");

            migrationBuilder.DropColumn(
                name: "budget_amount",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropColumn(
                name: "end_year",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropColumn(
                name: "lead_organization",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropColumn(
                name: "partner_organization",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropColumn(
                name: "start_year",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropColumn(
                name: "completion_year",
                schema: "brokerage",
                table: "expert_practical_projects");

            migrationBuilder.DropColumn(
                name: "outcome",
                schema: "brokerage",
                table: "expert_practical_projects");

            migrationBuilder.DropColumn(
                name: "description",
                schema: "brokerage",
                table: "expert_patents");

            migrationBuilder.DropColumn(
                name: "granted_at",
                schema: "brokerage",
                table: "expert_patents");

            migrationBuilder.DropColumn(
                name: "technology_readiness_level",
                schema: "brokerage",
                table: "expert_patents");

            migrationBuilder.DropColumn(
                name: "award_level",
                schema: "brokerage",
                table: "expert_awards");

            migrationBuilder.DropColumn(
                name: "description",
                schema: "brokerage",
                table: "expert_awards");
        }
    }
}
