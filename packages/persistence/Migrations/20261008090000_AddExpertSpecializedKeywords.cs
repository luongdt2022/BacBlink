using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20261008090000_AddExpertSpecializedKeywords")]
public sealed class AddExpertSpecializedKeywords : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string[]>(name: "specialized_keywords", schema: "brokerage", table: "expert_profiles",
            type: "text[]", nullable: false, defaultValue: System.Array.Empty<string>());
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "specialized_keywords", schema: "brokerage", table: "expert_profiles");
    }
}
