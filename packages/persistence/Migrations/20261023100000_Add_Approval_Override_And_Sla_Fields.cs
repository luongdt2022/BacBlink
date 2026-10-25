using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261023100000_Add_Approval_Override_And_Sla_Fields")]
public partial class Add_Approval_Override_And_Sla_Fields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "is_override",
            schema: "identity",
            table: "approval_requests",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "override_reason",
            schema: "identity",
            table: "approval_requests",
            type: "text",
            nullable: true);

        migrationBuilder.AddColumn<Guid>(
            name: "overridden_by_user_id",
            schema: "identity",
            table: "approval_requests",
            type: "uuid",
            nullable: true);

        migrationBuilder.AddColumn<DateTimeOffset>(
            name: "overridden_at_utc",
            schema: "identity",
            table: "approval_requests",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "is_sla_breached",
            schema: "identity",
            table: "approval_requests",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<double>(
            name: "sla_overdue_hours",
            schema: "identity",
            table: "approval_requests",
            type: "double precision",
            nullable: false,
            defaultValue: 0.0);

        migrationBuilder.AddColumn<bool>(
            name: "is_national_priority",
            schema: "identity",
            table: "approval_requests",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.CreateIndex(
            name: "idx_approval_sla_breach",
            schema: "identity",
            table: "approval_requests",
            columns: new[] { "is_sla_breached", "status" });

        migrationBuilder.CreateIndex(
            name: "idx_approval_central_queue",
            schema: "identity",
            table: "approval_requests",
            columns: new[] { "scope_type", "scope_id", "request_type", "status", "created_at" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "idx_approval_central_queue",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropIndex(
            name: "idx_approval_sla_breach",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropColumn(
            name: "is_national_priority",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropColumn(
            name: "sla_overdue_hours",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropColumn(
            name: "is_sla_breached",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropColumn(
            name: "overridden_at_utc",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropColumn(
            name: "overridden_by_user_id",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropColumn(
            name: "override_reason",
            schema: "identity",
            table: "approval_requests");

        migrationBuilder.DropColumn(
            name: "is_override",
            schema: "identity",
            table: "approval_requests");
    }
}
