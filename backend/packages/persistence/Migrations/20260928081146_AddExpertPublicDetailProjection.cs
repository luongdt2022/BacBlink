using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExpertPublicDetailProjection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                schema: "brokerage",
                table: "expert_training_records",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                schema: "brokerage",
                table: "expert_training_records",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                schema: "brokerage",
                table: "expert_research_projects",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                schema: "brokerage",
                table: "expert_research_projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                schema: "brokerage",
                table: "expert_publications",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                schema: "brokerage",
                table: "expert_publications",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "expert_code",
                schema: "brokerage",
                table: "expert_profiles",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_accepting_consultation",
                schema: "brokerage",
                table: "expert_profiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "public_bio",
                schema: "brokerage",
                table: "expert_profiles",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "visibility_status",
                schema: "brokerage",
                table: "expert_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "PRIVATE");

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                schema: "brokerage",
                table: "expert_practical_projects",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                schema: "brokerage",
                table: "expert_practical_projects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                schema: "brokerage",
                table: "expert_patents",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                schema: "brokerage",
                table: "expert_patents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                schema: "brokerage",
                table: "expert_employment_records",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                schema: "brokerage",
                table: "expert_employment_records",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                schema: "brokerage",
                table: "expert_awards",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                schema: "brokerage",
                table: "expert_awards",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "ix_expert_training_records_expert_profile_id_is_public_is_acti~",
                schema: "brokerage",
                table: "expert_training_records",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_research_projects_expert_profile_id_is_public_is_act~",
                schema: "brokerage",
                table: "expert_research_projects",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_publications_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_publications",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            // Existing rows must receive a deterministic public code before the unique index is created.
            // This migration is new and unapplied; the backfill preserves every existing profile.
            migrationBuilder.Sql("UPDATE brokerage.expert_profiles SET expert_code = 'CG-NACEN-' || upper(substr(replace(id::text, '-', ''), 1, 8)) WHERE expert_code IS NULL;");
            migrationBuilder.AlterColumn<string>(
                name: "expert_code",
                schema: "brokerage",
                table: "expert_profiles",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(40)",
                oldMaxLength: 40,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_expert_profiles_expert_code",
                schema: "brokerage",
                table: "expert_profiles",
                column: "expert_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_expert_profiles_status_visibility_status",
                schema: "brokerage",
                table: "expert_profiles",
                columns: new[] { "status", "visibility_status" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_practical_projects_expert_profile_id_is_public_is_ac~",
                schema: "brokerage",
                table: "expert_practical_projects",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_patents_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_patents",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_employment_records_expert_profile_id_is_public_is_ac~",
                schema: "brokerage",
                table: "expert_employment_records",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_awards_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_awards",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_expert_training_records_expert_profile_id_is_public_is_acti~",
                schema: "brokerage",
                table: "expert_training_records");

            migrationBuilder.DropIndex(
                name: "ix_expert_research_projects_expert_profile_id_is_public_is_act~",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropIndex(
                name: "ix_expert_publications_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_publications");

            migrationBuilder.DropIndex(
                name: "ix_expert_profiles_expert_code",
                schema: "brokerage",
                table: "expert_profiles");

            migrationBuilder.DropIndex(
                name: "ix_expert_profiles_status_visibility_status",
                schema: "brokerage",
                table: "expert_profiles");

            migrationBuilder.DropIndex(
                name: "ix_expert_practical_projects_expert_profile_id_is_public_is_ac~",
                schema: "brokerage",
                table: "expert_practical_projects");

            migrationBuilder.DropIndex(
                name: "ix_expert_patents_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_patents");

            migrationBuilder.DropIndex(
                name: "ix_expert_employment_records_expert_profile_id_is_public_is_ac~",
                schema: "brokerage",
                table: "expert_employment_records");

            migrationBuilder.DropIndex(
                name: "ix_expert_awards_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_awards");

            migrationBuilder.DropColumn(
                name: "is_active",
                schema: "brokerage",
                table: "expert_training_records");

            migrationBuilder.DropColumn(
                name: "is_public",
                schema: "brokerage",
                table: "expert_training_records");

            migrationBuilder.DropColumn(
                name: "is_active",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropColumn(
                name: "is_public",
                schema: "brokerage",
                table: "expert_research_projects");

            migrationBuilder.DropColumn(
                name: "is_active",
                schema: "brokerage",
                table: "expert_publications");

            migrationBuilder.DropColumn(
                name: "is_public",
                schema: "brokerage",
                table: "expert_publications");

            migrationBuilder.DropColumn(
                name: "expert_code",
                schema: "brokerage",
                table: "expert_profiles");

            migrationBuilder.DropColumn(
                name: "is_accepting_consultation",
                schema: "brokerage",
                table: "expert_profiles");

            migrationBuilder.DropColumn(
                name: "public_bio",
                schema: "brokerage",
                table: "expert_profiles");

            migrationBuilder.DropColumn(
                name: "visibility_status",
                schema: "brokerage",
                table: "expert_profiles");

            migrationBuilder.DropColumn(
                name: "is_active",
                schema: "brokerage",
                table: "expert_practical_projects");

            migrationBuilder.DropColumn(
                name: "is_public",
                schema: "brokerage",
                table: "expert_practical_projects");

            migrationBuilder.DropColumn(
                name: "is_active",
                schema: "brokerage",
                table: "expert_patents");

            migrationBuilder.DropColumn(
                name: "is_public",
                schema: "brokerage",
                table: "expert_patents");

            migrationBuilder.DropColumn(
                name: "is_active",
                schema: "brokerage",
                table: "expert_employment_records");

            migrationBuilder.DropColumn(
                name: "is_public",
                schema: "brokerage",
                table: "expert_employment_records");

            migrationBuilder.DropColumn(
                name: "is_active",
                schema: "brokerage",
                table: "expert_awards");

            migrationBuilder.DropColumn(
                name: "is_public",
                schema: "brokerage",
                table: "expert_awards");
        }
    }
}
