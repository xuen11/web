using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace website.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Banners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subtitle = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ImagePath = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banners", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Contacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FullName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EventDetails = table.Column<string>(type: "text", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contacts", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Date = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Detail = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Image = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ButtonText = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "StaffAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Email = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Password = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffAccounts", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Banners",
                columns: new[] { "Id", "ImagePath", "Subtitle", "Title", "UpdatedAt" },
                values: new object[] { 1, "uploads/default-banner.jpg", "Explore our exclusive Golden and Platinum Packages designed to make your event truly unforgettable.", "Elevate Your Event Experience", new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9472) });

            migrationBuilder.InsertData(
                table: "Events",
                columns: new[] { "Id", "ButtonText", "CreatedAt", "Date", "Detail", "Image", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Learn More", new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9487), "Sat, 29 June", "Event by Sam Sound & Lights", "/img/event1.jpg", "Lets plan your memorable moment at Sam Sound & Light", new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9487) },
                    { 2, "Learn More", new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9489), "Sat, 19 Nov", "Event by Karabaw Martial Arts & Fitness Centre", "/img/event2.jpg", "Steppin Out 1st Anniversary Competition", new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9490) }
                });

            migrationBuilder.InsertData(
                table: "StaffAccounts",
                columns: new[] { "Id", "CreatedAt", "Email", "Password", "Role", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9364), "staff@gmail.com", "staff123", "staff", new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9365) },
                    { 2, new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9367), "admin@gmail.com", "admin123", "admin", new DateTime(2025, 11, 14, 15, 18, 57, 447, DateTimeKind.Utc).AddTicks(9368) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Banners");

            migrationBuilder.DropTable(
                name: "Contacts");

            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropTable(
                name: "StaffAccounts");
        }
    }
}
