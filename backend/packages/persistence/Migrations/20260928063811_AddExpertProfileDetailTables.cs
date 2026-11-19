using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExpertProfileDetailTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "expert_ai_ingestions",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    provider = table.Column<string>(type: "text", nullable: true),
                    model_version = table.Column<string>(type: "text", nullable: true),
                    result_json = table.Column<string>(type: "jsonb", nullable: true),
                    confidence = table.Column<decimal>(type: "numeric", nullable: true),
                    error_code = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_ai_ingestions", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_ai_ingestions_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_awards",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    form = table.Column<string>(type: "text", nullable: true),
                    awarded_year = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_awards", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_awards_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_consents",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    consent_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    policy_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    accepted_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    source = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_consents", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_consents_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_documents",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    storage_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    sha256 = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    malware_scan_status = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_documents", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_documents_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_employment_records",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_date = table.Column<DateOnly>(type: "date", nullable: true),
                    to_date = table.Column<DateOnly>(type: "date", nullable: true),
                    organization = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    organization_address = table.Column<string>(type: "text", nullable: true),
                    position_title = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_employment_records", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_employment_records_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_patents",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    certificate_number = table.Column<string>(type: "text", nullable: true),
                    granted_year = table.Column<int>(type: "integer", nullable: true),
                    issuer = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_patents", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_patents_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_practical_projects",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    scale = table.Column<string>(type: "text", nullable: true),
                    receiving_organization = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_practical_projects", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_practical_projects_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_profile_status_history",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_status = table.Column<string>(type: "text", nullable: true),
                    to_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    reason = table.Column<string>(type: "text", nullable: true),
                    changed_by = table.Column<Guid>(type: "uuid", nullable: true),
                    approval_request_id = table.Column<Guid>(type: "uuid", nullable: true),
                    changed_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_profile_status_history", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_profile_status_history_expert_profiles_expert_profil~",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_publications",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    author_role = table.Column<string>(type: "text", nullable: true),
                    journal = table.Column<string>(type: "text", nullable: true),
                    published_year = table.Column<int>(type: "integer", nullable: true),
                    doi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    indexing = table.Column<string>(type: "text", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_publications", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_publications_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_research_projects",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    management_level = table.Column<string>(type: "text", nullable: true),
                    role = table.Column<string>(type: "text", nullable: true),
                    acceptance_status = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_research_projects", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_research_projects_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expert_training_records",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    expert_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    institution = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    major = table.Column<string>(type: "text", nullable: true),
                    graduation_year = table.Column<int>(type: "integer", nullable: true),
                    display_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_expert_training_records", x => x.id);
                    table.ForeignKey(
                        name: "fk_expert_training_records_expert_profiles_expert_profile_id",
                        column: x => x.expert_profile_id,
                        principalSchema: "brokerage",
                        principalTable: "expert_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_expert_ai_ingestions_expert_profile_id",
                schema: "brokerage",
                table: "expert_ai_ingestions",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_awards_expert_profile_id",
                schema: "brokerage",
                table: "expert_awards",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_consents_expert_profile_id",
                schema: "brokerage",
                table: "expert_consents",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_documents_expert_profile_id",
                schema: "brokerage",
                table: "expert_documents",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_documents_expert_profile_id_document_type_is_active",
                schema: "brokerage",
                table: "expert_documents",
                columns: new[] { "expert_profile_id", "document_type", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_employment_records_expert_profile_id",
                schema: "brokerage",
                table: "expert_employment_records",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_patents_expert_profile_id",
                schema: "brokerage",
                table: "expert_patents",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_practical_projects_expert_profile_id",
                schema: "brokerage",
                table: "expert_practical_projects",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_profile_status_history_expert_profile_id",
                schema: "brokerage",
                table: "expert_profile_status_history",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_publications_expert_profile_id",
                schema: "brokerage",
                table: "expert_publications",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_research_projects_expert_profile_id",
                schema: "brokerage",
                table: "expert_research_projects",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_training_records_expert_profile_id",
                schema: "brokerage",
                table: "expert_training_records",
                column: "expert_profile_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "expert_ai_ingestions",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_awards",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_consents",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_documents",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_employment_records",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_patents",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_practical_projects",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_profile_status_history",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_publications",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_research_projects",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "expert_training_records",
                schema: "brokerage");
        }
    }
}
