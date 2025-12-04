using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace website.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTitleDescriptionToPortfolio : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 4, 8, 30, 50, 431, DateTimeKind.Utc).AddTicks(9202), new DateTime(2025, 12, 4, 8, 30, 50, 431, DateTimeKind.Utc).AddTicks(9205) });

            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 4, 8, 30, 50, 431, DateTimeKind.Utc).AddTicks(9206), new DateTime(2025, 12, 4, 8, 30, 50, 431, DateTimeKind.Utc).AddTicks(9207) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
    }
}
