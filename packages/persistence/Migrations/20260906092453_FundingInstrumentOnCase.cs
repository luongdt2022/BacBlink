using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NacenTech.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FundingInstrumentOnCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "execution_in_platform_permitted",
                schema: "casework",
                table: "commercialization_cases",
                type: "boolean",
                nullable: true);

            // ADR-0014. `defaultValue` phải là `UNDETERMINED`, **không** phải chuỗi rỗng mà EF sinh ra mặc định:
            // chuỗi rỗng nằm ngoài từ vựng `FundingInstruments`, và một phép kiểm dạng "khác UNDETERMINED" sẽ cho
            // nó đi thẳng qua cổng QUALIFICATION. Hồ sơ cũ phải rơi vào đúng trạng thái *chưa khai*.
            migrationBuilder.AddColumn<string>(
                name: "funding_instrument",
                schema: "casework",
                table: "commercialization_cases",
                type: "character varying(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "UNDETERMINED");

            migrationBuilder.AddColumn<string>(
                name: "legal_form_ref",
                schema: "casework",
                table: "commercialization_cases",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "execution_in_platform_permitted",
                schema: "casework",
                table: "commercialization_cases");

            migrationBuilder.DropColumn(
                name: "funding_instrument",
                schema: "casework",
                table: "commercialization_cases");

            migrationBuilder.DropColumn(
                name: "legal_form_ref",
                schema: "casework",
                table: "commercialization_cases");
        }
    }
}
