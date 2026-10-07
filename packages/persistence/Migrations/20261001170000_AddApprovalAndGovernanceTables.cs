using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261001170000_AddApprovalAndGovernanceTables")]
public partial class AddApprovalAndGovernanceTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
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
                legacy_source_system = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                legacy_source_table = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                legacy_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                legacy_source_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                legacy_migrated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                legacy_mapping_version = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                legacy_batch_id = table.Column<Guid>(type: "uuid", nullable: true),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_approval_requests", x => x.id);
                table.ForeignKey(
                    name: "fk_approval_requests_persons_user_id",
                    column: x => x.user_id,
                    principalSchema: "identity",
                    principalTable: "persons",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
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
            name: "ix_organization_units_code",
            schema: "identity",
            table: "organization_units",
            column: "code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "idx_org_parent",
            schema: "identity",
            table: "organization_units",
            column: "parent_id");

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
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "approval_requests",
            schema: "identity");

        migrationBuilder.DropTable(
            name: "organization_units",
            schema: "identity");

        migrationBuilder.DropTable(
            name: "approval_audit_logs",
            schema: "identity");
    }
}
