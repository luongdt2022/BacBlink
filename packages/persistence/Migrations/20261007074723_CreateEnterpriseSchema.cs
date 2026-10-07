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
                name: "dataroom");

            migrationBuilder.EnsureSchema(
                name: "identity");

            migrationBuilder.EnsureSchema(
                name: "brokerage");

            migrationBuilder.EnsureSchema(
                name: "audit");

            migrationBuilder.EnsureSchema(
                name: "casework");

            migrationBuilder.EnsureSchema(
                name: "communication");

            migrationBuilder.EnsureSchema(
                name: "matching");

            migrationBuilder.EnsureSchema(
                name: "demand");

            migrationBuilder.EnsureSchema(
                name: "integration");

            migrationBuilder.EnsureSchema(
                name: "enterprise");

            migrationBuilder.EnsureSchema(
                name: "entitlement");

            migrationBuilder.EnsureSchema(
                name: "platform");

            migrationBuilder.EnsureSchema(
                name: "policy");

            migrationBuilder.EnsureSchema(
                name: "content");

            migrationBuilder.EnsureSchema(
                name: "technology");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:pgcrypto", ",,");

            migrationBuilder.CreateTable(
                name: "access_grants",
                schema: "dataroom",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    grantee_person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    purpose = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    ceiling = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    valid_from = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    valid_to = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    revoked_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    issued_by_actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
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
                    table.PrimaryKey("pk_access_grants", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "activation_tokens",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    consumed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_activation_tokens", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "approval_audit_logs",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    target_entity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    target_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    details_json = table.Column<string>(type: "jsonb", nullable: true),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_approval_audit_logs", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "approval_requests",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    request_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scope_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "GLOBAL"),
                    scope_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    payload_json = table.Column<string>(type: "jsonb", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "PENDING_REVIEW"),
                    assigned_officer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reviewed_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                    review_note = table.Column<string>(type: "text", nullable: true),
                    sla_deadline_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
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
                    table.PrimaryKey("pk_approval_requests", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "assignments",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    broker_person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    assigned_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    sla_due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ended_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_assignments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "audit_events",
                schema: "audit",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    actor_role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    object_kind = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    object_id = table.Column<Guid>(type: "uuid", nullable: true),
                    object_version = table.Column<int>(type: "integer", nullable: true),
                    purpose = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    outcome = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    rule_id = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    correlation_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    user_agent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    details = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_audit_events", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "broker_profiles",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    capacity = table.Column<int>(type: "integer", nullable: false),
                    sector_ids = table.Column<Guid[]>(type: "uuid[]", nullable: false),
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
                    table.PrimaryKey("pk_broker_profiles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "case_invitations",
                schema: "communication",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    requester_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    requester_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    target_id = table.Column<Guid>(type: "uuid", nullable: false),
                    requester_person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    target_person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    responded_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_case_invitations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "commercialization_cases",
                schema: "casework",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    track = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    stage = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    problem_owner_person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    lead_broker_person_id = table.Column<Guid>(type: "uuid", nullable: true),
                    demand_brief_id = table.Column<Guid>(type: "uuid", nullable: false),
                    demand_brief_version_no = table.Column<int>(type: "integer", nullable: false),
                    policy_snapshot_id = table.Column<Guid>(type: "uuid", nullable: true),
                    confidentiality_level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    budget_path_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    funding_instrument = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    legal_form_ref = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    execution_in_platform_permitted = table.Column<bool>(type: "boolean", nullable: true),
                    target_decision_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_commercialization_cases", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "content_chunks",
                schema: "matching",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    index = table.Column<int>(type: "integer", nullable: false),
                    text = table.Column<string>(type: "text", nullable: false),
                    embedding = table.Column<float[]>(type: "real[]", nullable: false),
                    embedding_model_version = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_content_chunks", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "demand_briefs",
                schema: "demand",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_person_id = table.Column<Guid>(type: "uuid", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    current_version_no = table.Column<int>(type: "integer", nullable: false),
                    ai_title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ai_processed_content = table.Column<string>(type: "text", nullable: true),
                    ai_processing_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ai_chunking_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    sector_ids = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_demand_briefs", x => x.id);
                });

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
                name: "documents",
                schema: "dataroom",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_person_id = table.Column<Guid>(type: "uuid", nullable: true),
                    kind = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    file_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    classification = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    section_code = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: true),
                    current_version_no = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_documents", x => x.id);
                });

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
                name: "expert_profiles",
                schema: "brokerage",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: true),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    expert_code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    visibility_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "PRIVATE"),
                    is_accepting_consultation = table.Column<bool>(type: "boolean", nullable: false),
                    public_bio = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    birth_year = table.Column<int>(type: "integer", nullable: false),
                    gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    id_card_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    id_card_date = table.Column<DateOnly>(type: "date", nullable: true),
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

            migrationBuilder.CreateTable(
                name: "idempotency_records",
                schema: "platform",
                columns: table => new
                {
                    key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    request_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    status_code = table.Column<int>(type: "integer", nullable: false),
                    response_body = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_idempotency_records", x => x.key);
                });

            migrationBuilder.CreateTable(
                name: "job_queue",
                schema: "platform",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    enqueued_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    run_after = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    dedup_key = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    attempts = table.Column<int>(type: "integer", nullable: false),
                    max_attempts = table.Column<int>(type: "integer", nullable: false),
                    locked_until = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    failed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    last_error = table.Column<string>(type: "text", nullable: true),
                    correlation_id = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_job_queue", x => x.id);
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
                name: "match_rounds",
                schema: "matching",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    subject_id = table.Column<Guid>(type: "uuid", nullable: false),
                    search_engine_version = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    embedding_model_version = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    scoring_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    query_text = table.Column<string>(type: "text", nullable: true),
                    is_authoritative = table.Column<bool>(type: "boolean", nullable: false),
                    completed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("pk_match_rounds", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                schema: "communication",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "organization_units",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    unit_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    parent_id = table.Column<Guid>(type: "uuid", nullable: true),
                    province_id = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "ACTIVE"),
                    created_at_utc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_organization_units", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "outbox_messages",
                schema: "platform",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    payload = table.Column<string>(type: "jsonb", nullable: false),
                    occurred_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    processed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    attempts = table.Column<int>(type: "integer", nullable: false),
                    locked_until = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    last_error = table.Column<string>(type: "text", nullable: true),
                    correlation_id = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_outbox_messages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    consumed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_password_reset_tokens", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "persons",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash_algorithm = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    previous_password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    previous_password_hash_algorithm = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    organization_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    platform_role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scope_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "GLOBAL"),
                    scope_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    matching_auto = table.Column<bool>(type: "boolean", nullable: false),
                    preferences_updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("pk_persons", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "policy_snapshots",
                schema: "policy",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    resolved_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    platform_policy_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    track_policy_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    document_json = table.Column<string>(type: "jsonb", nullable: false),
                    document_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    canonicalization_version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    supersedes_id = table.Column<Guid>(type: "uuid", nullable: true),
                    supersede_decision_record_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_current = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("pk_policy_snapshots", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "scheduled_obligations",
                schema: "platform",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: true),
                    kind = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    due_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    timezone_for_display = table.Column<string>(type: "text", nullable: false),
                    payload_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    state = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    fired_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    acknowledged_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    attempts = table.Column<int>(type: "integer", nullable: false),
                    last_error = table.Column<string>(type: "text", nullable: true),
                    cancel_reason = table.Column<string>(type: "text", nullable: true),
                    cancelled_by_actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_scheduled_obligations", x => x.id);
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
                name: "search_query_logs",
                schema: "matching",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    query_text = table.Column<string>(type: "text", nullable: false),
                    target_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    sector_ids = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    min_score = table.Column<double>(type: "double precision", nullable: false),
                    limit = table.Column<int>(type: "integer", nullable: false),
                    scoring_mode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    engine_version = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    result_subject_ids = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    result_scores = table.Column<double[]>(type: "double precision[]", nullable: false),
                    took_ms = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_search_query_logs", x => x.id);
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
                name: "stories",
                schema: "content",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    lesson = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    is_hidden = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("pk_stories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "taxonomy_terms",
                schema: "policy",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    metadata = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "{}"),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("pk_taxonomy_terms", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "technology_assets",
                schema: "technology",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_person_id = table.Column<Guid>(type: "uuid", nullable: true),
                    publication_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    quality_level = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    current_version_no = table.Column<int>(type: "integer", nullable: false),
                    ai_title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ai_processed_content = table.Column<string>(type: "text", nullable: true),
                    ai_processing_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ai_chunking_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    sector_ids = table.Column<Guid[]>(type: "uuid[]", nullable: false),
                    category_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("pk_technology_assets", x => x.id);
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
                name: "case_holds",
                schema: "casework",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    opened_by_actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    opened_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    released_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    release_decision_record_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_case_holds", x => x.id);
                    table.ForeignKey(
                        name: "fk_case_holds_commercialization_cases_case_id",
                        column: x => x.case_id,
                        principalSchema: "casework",
                        principalTable: "commercialization_cases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "case_parties",
                schema: "casework",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    person_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    since = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    until = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_case_parties", x => x.id);
                    table.ForeignKey(
                        name: "fk_case_parties_commercialization_cases_case_id",
                        column: x => x.case_id,
                        principalSchema: "casework",
                        principalTable: "commercialization_cases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "decision_records",
                schema: "casework",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    case_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_stage = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    to_stage = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    decision = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    reason_codes = table.Column<string[]>(type: "text[]", nullable: false),
                    rationale = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    decided_by_actor_ref = table.Column<Guid>(type: "uuid", nullable: false),
                    mandate_ref = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    evidence_refs = table.Column<string[]>(type: "text[]", nullable: false),
                    policy_snapshot_id = table.Column<Guid>(type: "uuid", nullable: true),
                    decided_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    supersedes_id = table.Column<Guid>(type: "uuid", nullable: true),
                    signature_ref = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_decision_records", x => x.id);
                    table.ForeignKey(
                        name: "fk_decision_records_commercialization_cases_case_id",
                        column: x => x.case_id,
                        principalSchema: "casework",
                        principalTable: "commercialization_cases",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "demand_brief_versions",
                schema: "demand",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    demand_brief_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    problem_statement = table.Column<string>(type: "text", nullable: true),
                    created_by_actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_demand_brief_versions", x => x.id);
                    table.ForeignKey(
                        name: "fk_demand_brief_versions_demand_briefs_demand_brief_id",
                        column: x => x.demand_brief_id,
                        principalSchema: "demand",
                        principalTable: "demand_briefs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "document_versions",
                schema: "dataroom",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    storage_key = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    content_type = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    size = table.Column<long>(type: "bigint", nullable: true),
                    text_content = table.Column<string>(type: "text", nullable: true),
                    sha256 = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_document_versions", x => x.id);
                    table.ForeignKey(
                        name: "fk_document_versions_documents_document_id",
                        column: x => x.document_id,
                        principalSchema: "dataroom",
                        principalTable: "documents",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
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
                    awarded_year = table.Column<int>(type: "integer", nullable: true),
                    description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    award_level = table.Column<string>(type: "text", nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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
                    granted_at = table.Column<DateOnly>(type: "date", nullable: true),
                    issuer = table.Column<string>(type: "text", nullable: true),
                    technology_readiness_level = table.Column<int>(type: "integer", nullable: true),
                    description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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
                    receiving_organization = table.Column<string>(type: "text", nullable: true),
                    completion_year = table.Column<int>(type: "integer", nullable: true),
                    outcome = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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
                    acceptance_status = table.Column<string>(type: "text", nullable: true),
                    start_year = table.Column<int>(type: "integer", nullable: true),
                    end_year = table.Column<int>(type: "integer", nullable: true),
                    lead_organization = table.Column<string>(type: "text", nullable: true),
                    partner_organization = table.Column<string>(type: "text", nullable: true),
                    budget_amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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
                    display_order = table.Column<int>(type: "integer", nullable: false),
                    is_public = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
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

            migrationBuilder.CreateTable(
                name: "match_candidates",
                schema: "matching",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    round_id = table.Column<Guid>(type: "uuid", nullable: false),
                    candidate_kind = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    candidate_id = table.Column<Guid>(type: "uuid", nullable: false),
                    raw_score = table.Column<double>(type: "double precision", nullable: false),
                    matched_chunk = table.Column<string>(type: "text", nullable: false),
                    chunk_index = table.Column<int>(type: "integer", nullable: false),
                    rank = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    reason_codes = table.Column<string[]>(type: "text[]", nullable: false),
                    computed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_match_candidates", x => x.id);
                    table.ForeignKey(
                        name: "fk_match_candidates_match_rounds_round_id",
                        column: x => x.round_id,
                        principalSchema: "matching",
                        principalTable: "match_rounds",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "technology_package_versions",
                schema: "technology",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    technology_asset_id = table.Column<Guid>(type: "uuid", nullable: false),
                    version_no = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_by_actor_ref = table.Column<Guid>(type: "uuid", nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_technology_package_versions", x => x.id);
                    table.ForeignKey(
                        name: "fk_technology_package_versions_technology_assets_technology_as~",
                        column: x => x.technology_asset_id,
                        principalSchema: "technology",
                        principalTable: "technology_assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_access_grants_subject_kind_subject_id_grantee_person_id",
                schema: "dataroom",
                table: "access_grants",
                columns: new[] { "subject_kind", "subject_id", "grantee_person_id" });

            migrationBuilder.CreateIndex(
                name: "ix_activation_tokens_expires_at",
                schema: "identity",
                table: "activation_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_activation_tokens_person_id",
                schema: "identity",
                table: "activation_tokens",
                column: "person_id");

            migrationBuilder.CreateIndex(
                name: "ix_activation_tokens_token",
                schema: "identity",
                table: "activation_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_audit_actor",
                schema: "identity",
                table: "approval_audit_logs",
                columns: new[] { "actor_id", "created_at_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_approval_audit_logs_target_entity_target_id",
                schema: "identity",
                table: "approval_audit_logs",
                columns: new[] { "target_entity", "target_id" });

            migrationBuilder.CreateIndex(
                name: "idx_approval_scope",
                schema: "identity",
                table: "approval_requests",
                columns: new[] { "scope_type", "scope_id", "status" });

            migrationBuilder.CreateIndex(
                name: "idx_approval_sla",
                schema: "identity",
                table: "approval_requests",
                columns: new[] { "status", "sla_deadline_utc" });

            migrationBuilder.CreateIndex(
                name: "ix_approval_requests_user_id",
                schema: "identity",
                table: "approval_requests",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_assignments_broker_person_id_status",
                schema: "brokerage",
                table: "assignments",
                columns: new[] { "broker_person_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_assignments_case_id",
                schema: "brokerage",
                table: "assignments",
                column: "case_id");

            migrationBuilder.CreateIndex(
                name: "ix_audit_events_actor_ref_occurred_at",
                schema: "audit",
                table: "audit_events",
                columns: new[] { "actor_ref", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_events_object_kind_object_id",
                schema: "audit",
                table: "audit_events",
                columns: new[] { "object_kind", "object_id" });

            migrationBuilder.CreateIndex(
                name: "ix_audit_events_occurred_at",
                schema: "audit",
                table: "audit_events",
                column: "occurred_at");

            migrationBuilder.CreateIndex(
                name: "ix_broker_profiles_person_id",
                schema: "brokerage",
                table: "broker_profiles",
                column: "person_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_case_holds_case_id_released_at",
                schema: "casework",
                table: "case_holds",
                columns: new[] { "case_id", "released_at" });

            migrationBuilder.CreateIndex(
                name: "ix_case_invitations_requester_kind_requester_id_status",
                schema: "communication",
                table: "case_invitations",
                columns: new[] { "requester_kind", "requester_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_case_invitations_requester_person_id",
                schema: "communication",
                table: "case_invitations",
                column: "requester_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_case_invitations_target_kind_target_id_status",
                schema: "communication",
                table: "case_invitations",
                columns: new[] { "target_kind", "target_id", "status" });

            migrationBuilder.CreateIndex(
                name: "ix_case_invitations_target_person_id",
                schema: "communication",
                table: "case_invitations",
                column: "target_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_case_parties_case_id_person_id_role",
                schema: "casework",
                table: "case_parties",
                columns: new[] { "case_id", "person_id", "role" });

            migrationBuilder.CreateIndex(
                name: "ix_commercialization_cases_case_code",
                schema: "casework",
                table: "commercialization_cases",
                column: "case_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_commercialization_cases_lead_broker_person_id",
                schema: "casework",
                table: "commercialization_cases",
                column: "lead_broker_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_commercialization_cases_problem_owner_person_id",
                schema: "casework",
                table: "commercialization_cases",
                column: "problem_owner_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_commercialization_cases_stage",
                schema: "casework",
                table: "commercialization_cases",
                column: "stage");

            migrationBuilder.CreateIndex(
                name: "ix_content_chunks_subject_kind_subject_id_index",
                schema: "matching",
                table: "content_chunks",
                columns: new[] { "subject_kind", "subject_id", "index" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_decision_records_case_id_decided_at",
                schema: "casework",
                table: "decision_records",
                columns: new[] { "case_id", "decided_at" });

            migrationBuilder.CreateIndex(
                name: "ix_demand_brief_versions_demand_brief_id_version_no",
                schema: "demand",
                table: "demand_brief_versions",
                columns: new[] { "demand_brief_id", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_demand_briefs_deleted_at",
                schema: "demand",
                table: "demand_briefs",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_demand_briefs_owner_person_id",
                schema: "demand",
                table: "demand_briefs",
                column: "owner_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_demand_briefs_status",
                schema: "demand",
                table: "demand_briefs",
                column: "status");

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
                name: "ix_document_versions_document_id_version_no",
                schema: "dataroom",
                table: "document_versions",
                columns: new[] { "document_id", "version_no" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_document_versions_storage_key",
                schema: "dataroom",
                table: "document_versions",
                column: "storage_key");

            migrationBuilder.CreateIndex(
                name: "ix_documents_subject_kind_subject_id",
                schema: "dataroom",
                table: "documents",
                columns: new[] { "subject_kind", "subject_id" });

            migrationBuilder.CreateIndex(
                name: "ix_documents_subject_kind_subject_id_section_code",
                schema: "dataroom",
                table: "documents",
                columns: new[] { "subject_kind", "subject_id", "section_code" });

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

            migrationBuilder.CreateIndex(
                name: "ix_entitlements_agreement_id_capability_code",
                schema: "entitlement",
                table: "entitlements",
                columns: new[] { "agreement_id", "capability_code" },
                unique: true);

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
                name: "ix_expert_awards_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_awards",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

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
                name: "ix_expert_employment_records_expert_profile_id_is_public_is_ac~",
                schema: "brokerage",
                table: "expert_employment_records",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_patents_expert_profile_id",
                schema: "brokerage",
                table: "expert_patents",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_patents_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_patents",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_practical_projects_expert_profile_id",
                schema: "brokerage",
                table: "expert_practical_projects",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_practical_projects_expert_profile_id_is_public_is_ac~",
                schema: "brokerage",
                table: "expert_practical_projects",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_profile_private_details_expert_profile_id",
                schema: "brokerage",
                table: "expert_profile_private_details",
                column: "expert_profile_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_expert_profile_status_history_expert_profile_id",
                schema: "brokerage",
                table: "expert_profile_status_history",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_profiles_expert_code",
                schema: "brokerage",
                table: "expert_profiles",
                column: "expert_code",
                unique: true);

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

            migrationBuilder.CreateIndex(
                name: "ix_expert_profiles_status_visibility_status",
                schema: "brokerage",
                table: "expert_profiles",
                columns: new[] { "status", "visibility_status" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_publications_expert_profile_id",
                schema: "brokerage",
                table: "expert_publications",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_publications_expert_profile_id_is_public_is_active",
                schema: "brokerage",
                table: "expert_publications",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_research_projects_expert_profile_id",
                schema: "brokerage",
                table: "expert_research_projects",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_research_projects_expert_profile_id_is_public_is_act~",
                schema: "brokerage",
                table: "expert_research_projects",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_expert_training_records_expert_profile_id",
                schema: "brokerage",
                table: "expert_training_records",
                column: "expert_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_expert_training_records_expert_profile_id_is_public_is_acti~",
                schema: "brokerage",
                table: "expert_training_records",
                columns: new[] { "expert_profile_id", "is_public", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_idempotency_records_created_at",
                schema: "platform",
                table: "idempotency_records",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_job_queue_completed_at_failed_at_run_after",
                schema: "platform",
                table: "job_queue",
                columns: new[] { "completed_at", "failed_at", "run_after" });

            migrationBuilder.CreateIndex(
                name: "ix_job_queue_dedup_key",
                schema: "platform",
                table: "job_queue",
                column: "dedup_key",
                unique: true,
                filter: "dedup_key IS NOT NULL AND completed_at IS NULL AND failed_at IS NULL");

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
                name: "ix_match_candidates_candidate_kind_candidate_id",
                schema: "matching",
                table: "match_candidates",
                columns: new[] { "candidate_kind", "candidate_id" });

            migrationBuilder.CreateIndex(
                name: "ix_match_candidates_round_id_rank",
                schema: "matching",
                table: "match_candidates",
                columns: new[] { "round_id", "rank" });

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
                name: "ix_match_rounds_subject_kind_subject_id_created_at",
                schema: "matching",
                table: "match_rounds",
                columns: new[] { "subject_kind", "subject_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_match_rounds_subject_kind_subject_id_is_authoritative",
                schema: "matching",
                table: "match_rounds",
                columns: new[] { "subject_kind", "subject_id", "is_authoritative" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_person_id_created_at",
                schema: "communication",
                table: "notifications",
                columns: new[] { "person_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_notifications_person_id_is_read",
                schema: "communication",
                table: "notifications",
                columns: new[] { "person_id", "is_read" });

            migrationBuilder.CreateIndex(
                name: "idx_org_parent",
                schema: "identity",
                table: "organization_units",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "ix_organization_units_code",
                schema: "identity",
                table: "organization_units",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_outbox_messages_processed_at_occurred_at",
                schema: "platform",
                table: "outbox_messages",
                columns: new[] { "processed_at", "occurred_at" });

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_expires_at",
                schema: "identity",
                table: "password_reset_tokens",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_person_id",
                schema: "identity",
                table: "password_reset_tokens",
                column: "person_id");

            migrationBuilder.CreateIndex(
                name: "ix_password_reset_tokens_token",
                schema: "identity",
                table: "password_reset_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_persons_email",
                schema: "identity",
                table: "persons",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_persons_platform_role_is_active",
                schema: "identity",
                table: "persons",
                columns: new[] { "platform_role", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_persons_scope_type_scope_id",
                schema: "identity",
                table: "persons",
                columns: new[] { "scope_type", "scope_id" });

            migrationBuilder.CreateIndex(
                name: "ix_policy_snapshots_case_id_is_current",
                schema: "policy",
                table: "policy_snapshots",
                columns: new[] { "case_id", "is_current" });

            migrationBuilder.CreateIndex(
                name: "ix_scheduled_obligations_state_due_at",
                schema: "platform",
                table: "scheduled_obligations",
                columns: new[] { "state", "due_at" });

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
                name: "ix_search_query_logs_created_at",
                schema: "matching",
                table: "search_query_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_source_records_source_external_id",
                schema: "integration",
                table: "source_records",
                columns: new[] { "source", "external_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_stories_author_person_id",
                schema: "content",
                table: "stories",
                column: "author_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_stories_status_is_hidden",
                schema: "content",
                table: "stories",
                columns: new[] { "status", "is_hidden" });

            migrationBuilder.CreateIndex(
                name: "ix_taxonomy_terms_code",
                schema: "policy",
                table: "taxonomy_terms",
                column: "code");

            migrationBuilder.CreateIndex(
                name: "ix_taxonomy_terms_kind_code",
                schema: "policy",
                table: "taxonomy_terms",
                columns: new[] { "kind", "code" },
                unique: true,
                filter: "code IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_taxonomy_terms_kind_is_active",
                schema: "policy",
                table: "taxonomy_terms",
                columns: new[] { "kind", "is_active" });

            migrationBuilder.CreateIndex(
                name: "ix_taxonomy_terms_kind_name",
                schema: "policy",
                table: "taxonomy_terms",
                columns: new[] { "kind", "name" });

            migrationBuilder.CreateIndex(
                name: "ix_technology_assets_deleted_at",
                schema: "technology",
                table: "technology_assets",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_technology_assets_owner_person_id",
                schema: "technology",
                table: "technology_assets",
                column: "owner_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_technology_assets_publication_status",
                schema: "technology",
                table: "technology_assets",
                column: "publication_status");

            migrationBuilder.CreateIndex(
                name: "ix_technology_package_versions_technology_asset_id_version_no",
                schema: "technology",
                table: "technology_package_versions",
                columns: new[] { "technology_asset_id", "version_no" },
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
                name: "access_grants",
                schema: "dataroom");

            migrationBuilder.DropTable(
                name: "activation_tokens",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "approval_audit_logs",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "approval_requests",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "assignments",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "audit_events",
                schema: "audit");

            migrationBuilder.DropTable(
                name: "broker_profiles",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "case_holds",
                schema: "casework");

            migrationBuilder.DropTable(
                name: "case_invitations",
                schema: "communication");

            migrationBuilder.DropTable(
                name: "case_parties",
                schema: "casework");

            migrationBuilder.DropTable(
                name: "content_chunks",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "decision_records",
                schema: "casework");

            migrationBuilder.DropTable(
                name: "demand_brief_versions",
                schema: "demand");

            migrationBuilder.DropTable(
                name: "demand_signals",
                schema: "integration");

            migrationBuilder.DropTable(
                name: "document_versions",
                schema: "dataroom");

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
                name: "entitlements",
                schema: "entitlement");

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
                name: "expert_profile_private_details",
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

            migrationBuilder.DropTable(
                name: "idempotency_records",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "job_queue",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "match_candidates",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "match_exclusions",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "notifications",
                schema: "communication");

            migrationBuilder.DropTable(
                name: "organization_units",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "outbox_messages",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "password_reset_tokens",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "persons",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "policy_snapshots",
                schema: "policy");

            migrationBuilder.DropTable(
                name: "scheduled_obligations",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "search_feedback",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "search_query_logs",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "source_records",
                schema: "integration");

            migrationBuilder.DropTable(
                name: "stories",
                schema: "content");

            migrationBuilder.DropTable(
                name: "taxonomy_terms",
                schema: "policy");

            migrationBuilder.DropTable(
                name: "technology_package_versions",
                schema: "technology");

            migrationBuilder.DropTable(
                name: "usage_records",
                schema: "entitlement");

            migrationBuilder.DropTable(
                name: "commercialization_cases",
                schema: "casework");

            migrationBuilder.DropTable(
                name: "demand_briefs",
                schema: "demand");

            migrationBuilder.DropTable(
                name: "documents",
                schema: "dataroom");

            migrationBuilder.DropTable(
                name: "enterprises",
                schema: "enterprise");

            migrationBuilder.DropTable(
                name: "managed_service_agreements",
                schema: "entitlement");

            migrationBuilder.DropTable(
                name: "expert_profiles",
                schema: "brokerage");

            migrationBuilder.DropTable(
                name: "match_rounds",
                schema: "matching");

            migrationBuilder.DropTable(
                name: "technology_assets",
                schema: "technology");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:pgcrypto", ",,");
        }
    }
}
