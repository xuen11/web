using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace website.Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePortfolio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Portfolios",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Portfolios",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 3, 9, 58, 17, 838, DateTimeKind.Utc).AddTicks(5552), new DateTime(2025, 12, 3, 9, 58, 17, 838, DateTimeKind.Utc).AddTicks(5554) });

            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 3, 9, 58, 17, 838, DateTimeKind.Utc).AddTicks(5556), new DateTime(2025, 12, 3, 9, 58, 17, 838, DateTimeKind.Utc).AddTicks(5556) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Portfolios");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Portfolios");

            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 3, 7, 5, 17, 63, DateTimeKind.Utc).AddTicks(4649), new DateTime(2025, 12, 3, 7, 5, 17, 63, DateTimeKind.Utc).AddTicks(4652) });

            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 3, 7, 5, 17, 63, DateTimeKind.Utc).AddTicks(4654), new DateTime(2025, 12, 3, 7, 5, 17, 63, DateTimeKind.Utc).AddTicks(4654) });
        }
    }
}
