using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace website.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddTitleToService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 3, 6, 59, 2, 258, DateTimeKind.Utc).AddTicks(4708), new DateTime(2025, 12, 3, 6, 59, 2, 258, DateTimeKind.Utc).AddTicks(4710) });

            migrationBuilder.UpdateData(
                table: "StaffAccounts",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 12, 3, 6, 59, 2, 258, DateTimeKind.Utc).AddTicks(4712), new DateTime(2025, 12, 3, 6, 59, 2, 258, DateTimeKind.Utc).AddTicks(4712) });
        }
    }
}
