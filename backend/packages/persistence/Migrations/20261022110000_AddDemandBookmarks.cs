using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261022110000_AddDemandBookmarks")]
public sealed class AddDemandBookmarks : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "demand_bookmarks",
            schema: "demand",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                person_id = table.Column<Guid>(type: "uuid", nullable: false),
                demand_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_demand_bookmarks", x => x.id);
            });

        migrationBuilder.CreateIndex(
            name: "ix_demand_bookmarks_person_id_demand_item_id",
            schema: "demand",
            table: "demand_bookmarks",
            columns: new[] { "person_id", "demand_item_id" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "ix_demand_bookmarks_person_id",
            schema: "demand",
            table: "demand_bookmarks",
            column: "person_id");

        migrationBuilder.CreateIndex(
            name: "ix_demand_bookmarks_demand_item_id",
            schema: "demand",
            table: "demand_bookmarks",
            column: "demand_item_id");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "demand_bookmarks",
            schema: "demand");
    }
}
