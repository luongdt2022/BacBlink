using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    [DbContext(typeof(NacenTechDbContext))]
    [Migration("20260925103000_ScopedMultiTierRbac")]
    /// <inheritdoc />
    public partial class ScopedMultiTierRbac : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "platform_role",
                schema: "identity",
                table: "persons",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<string>(
                name: "scope_type",
                schema: "identity",
                table: "persons",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "GLOBAL");

            migrationBuilder.AddColumn<string>(
                name: "scope_id",
                schema: "identity",
                table: "persons",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_persons_scope_type_scope_id",
                schema: "identity",
                table: "persons",
                columns: new[] { "scope_type", "scope_id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_persons_scope_type_scope_id",
                schema: "identity",
                table: "persons");

            migrationBuilder.DropColumn(
                name: "scope_type",
                schema: "identity",
                table: "persons");

            migrationBuilder.DropColumn(
                name: "scope_id",
                schema: "identity",
                table: "persons");

            migrationBuilder.AlterColumn<string>(
                name: "platform_role",
                schema: "identity",
                table: "persons",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
