using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations;

[DbContext(typeof(NacenTechDbContext))]
[Migration("20260929140000_MakeExpertIdentityCardOptional")]
public partial class MakeExpertIdentityCardOptional : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(
            name: "id_card_number",
            schema: "brokerage",
            table: "expert_profiles",
            type: "character varying(20)",
            maxLength: 20,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "character varying(20)",
            oldMaxLength: 20);

        migrationBuilder.AlterColumn<DateOnly>(
            name: "id_card_date",
            schema: "brokerage",
            table: "expert_profiles",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateOnly),
            oldType: "date");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<string>(name: "id_card_number", schema: "brokerage", table: "expert_profiles", type: "character varying(20)", maxLength: 20, nullable: false, oldClrType: typeof(string), oldType: "character varying(20)", oldMaxLength: 20, oldNullable: true);
        migrationBuilder.AlterColumn<DateOnly>(name: "id_card_date", schema: "brokerage", table: "expert_profiles", type: "date", nullable: false, oldClrType: typeof(DateOnly), oldType: "date", oldNullable: true);
    }
}
