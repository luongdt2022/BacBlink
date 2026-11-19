using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SignalsEntitlementsAndMatchExplainability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "integration");

            migrationBuilder.EnsureSchema(
                name: "entitlement");

            migrationBuilder.AddColumn<double[]>(
                name: "result_scores",
                schema: "matching",
                table: "search_query_logs",
                type: "double precision[]",
                nullable: false,
                defaultValue: new double[0]);

            migrationBuilder.AddColumn<string[]>(
                name: "reason_codes",
                schema: "matching",
                table: "match_candidates",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.CreateTable(
                name: "demand_signals",
                schema: "integration",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_record_id = table.Column<Guid>(type: "uuid", nullable: false),
                    signal_class = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    summary = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    buyer_name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    sector_ids = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    budget_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    budget_currency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: true),
                    observed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    converted_demand_brief_id = table.Column<Guid>(type: "uuid", nullable: true),
                    decided_by_actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    decision_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    decided_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_demand_signals", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "managed_service_agreements",
                schema: "entitlement",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    payer_kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    payer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_line = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    reference = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    period_start = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    period_end = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    invoice_reference = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
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
                    table.PrimaryKey("pk_managed_service_agreements", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "match_exclusions",
                schema: "matching",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    round_id = table.Column<Guid>(type: "uuid", nullable: false),
                    candidate_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    candidate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    raw_score = table.Column<double>(type: "double precision", nullable: true),
                    reason_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    detail = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    computed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_match_exclusions", x => x.id);
                    table.ForeignKey(
                        name: "fk_match_exclusions_match_rounds_round_id",
                        column: x => x.round_id,
                        principalSchema: "matching",
                        principalTable: "match_rounds",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "search_feedback",
                schema: "matching",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    query_log_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    rank = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    grade = table.Column<int>(type: "integer", nullable: true),
                    actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_search_feedback", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "source_records",
                schema: "integration",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    source = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    external_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    content_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    license = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    authority_level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    fetched_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    source_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    payload_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_source_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "usage_records",
                schema: "entitlement",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    payer_kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    payer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    capability_code = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    agreement_id = table.Column<Guid>(type: "uuid", nullable: true),
                    amount = table.Column<int>(type: "integer", nullable: false),
                    outcome = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usage_records", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "entitlements",
                schema: "entitlement",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    agreement_id = table.Column<Guid>(type: "uuid", nullable: false),
                    capability_code = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    quota_limit = table.Column<int>(type: "integer", nullable: true),
                    consumed = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_entitlements", x => x.id);
                    table.ForeignKey(
                        name: "fk_entitlements_managed_service_agreements_agreement_id",
                        column: x => x.agreement_id,
                        principalSchema: "entitlement",
                        principalTable: "managed_service_agreements",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_demand_signals_source_record_id",
                schema: "integration",
                table: "demand_signals",
                column: "source_record_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_demand_signals_status_signal_class_observed_at",
                schema: "integration",
                table: "demand_signals",
                columns: new[] { "status", "signal_class", "observed_at" });

            migrationBuilder.CreateIndex(
                name: "ix_entitlements_agreement_id_capability_code",
                schema: "entitlement",
                table: "entitlements",
                columns: new[] { "agreement_id", "capability_code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_managed_service_agreements_payer_kind_payer_id_status_perio~",
                schema: "entitlement",
                table: "managed_service_agreements",
                columns: new[] { "payer_kind", "payer_id", "status", "period_end" });

            migrationBuilder.CreateIndex(
                name: "ix_managed_service_agreements_reference",
                schema: "entitlement",
                table: "managed_service_agreements",
                column: "reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_match_exclusions_candidate_kind_candidate_id",
                schema: "matching",
                table: "match_exclusions",
                columns: new[] { "candidate_kind", "candidate_id" });

            migrationBuilder.CreateIndex(
                name: "ix_match_exclusions_round_id_reason_code",
                schema: "matching",
                table: "match_exclusions",
                columns: new[] { "round_id", "reason_code" });

            migrationBuilder.CreateIndex(
                name: "ix_search_feedback_kind_created_at",
                schema: "matching",
                table: "search_feedback",
                columns: new[] { "kind", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_search_feedback_query_log_id_subject_kind_subject_id_kind_a~",
                schema: "matching",
                table: "search_feedback",
                columns: new[] { "query_log_id", "subject_kind", "subject_id", "kind", "actor_ref" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_source_records_source_external_id",
                schema: "integration",
                table: "source_records",
                columns: new[] { "source", "external_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_usage_records_outcome_capability_code_occurred_at",
                schema: "entitlement",
                table: "usage_records",
                columns: new[] { "outcome", "capability_code", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_usage_records_payer_kind_payer_id_occurred_at",
                schema: "entitlement",
                table: "usage_records",
                columns: new[] { "payer_kind", "payer_id", "occurred_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "demand_signals",
                schema: "integration");

            migrationBuilder.DropTable(
                name: "entitlements",
                schema: "entitlement");

            migrationBuilder.DropTable(
                name: "match_exclusions",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "search_feedback",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "source_records",
                schema: "integration");

            migrationBuilder.DropTable(
                name: "usage_records",
                schema: "entitlement");

            migrationBuilder.DropTable(
                name: "managed_service_agreements",
                schema: "entitlement");

            migrationBuilder.DropColumn(
                name: "result_scores",
                schema: "matching",
                table: "search_query_logs");

            migrationBuilder.DropColumn(
                name: "reason_codes",
                schema: "matching",
                table: "match_candidates");
        }
    }
}
