using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add controllers
builder.Services.AddControllers();

// Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Get connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    connectionString = Environment.GetEnvironmentVariable("DefaultConnection");
}

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new Exception("No database connection found. Please set DefaultConnection.");
}

Console.WriteLine($"Using MySQL connection: {connectionString}");

builder.Services.AddDbContext<AdminDbContext>(options =>
{
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
            "https://web-kohl-three-21.vercel.app",
            "http://localhost:5173",
            "https://your-actual-vercel-domain.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.UseStaticFiles();

app.MapControllers();

app.MapGet("/", () => "Backend API is running!");
app.MapGet("/health", () => Results.Json(new { status = "Healthy", timestamp = DateTime.UtcNow }));

app.MapGet("/debug/tables", async (HttpContext httpContext) =>
{
    try
    {
        using var scope = httpContext.RequestServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
        var connection = context.Database.GetDbConnection();
        await connection.OpenAsync();

        var command = connection.CreateCommand();
        command.CommandText = "SHOW TABLES";

        var tables = new List<string>();
        using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            tables.Add(reader.GetString(0));
        }

        return Results.Json(new { success = true, tables, tableCount = tables.Count });
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, error = ex.Message });
    }
});

// Debug endpoint to check events
app.MapGet("/debug/events", async (HttpContext httpContext) =>
{
    try
    {
        using var scope = httpContext.RequestServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
        var events = await context.Events.ToListAsync();

        return Results.Json(new
        {
            success = true,
            count = events.Count,
            events = events.Select(e => new { e.Id, e.Title, e.Date, e.Image })
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, error = ex.Message });
    }
});

// ADD THIS: Simple contact endpoint for testing
app.MapPost("/api/contact", async (HttpContext httpContext, Contact contact) =>
{
    try
    {
        using var scope = httpContext.RequestServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AdminDbContext>();

        contact.CreatedDate = DateTime.UtcNow;
        context.Contacts.Add(contact);
        await context.SaveChangesAsync();

        return Results.Ok(new
        {
            success = true,
            message = "Thank you! Your message has been sent successfully."
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new
        {
            success = false,
            message = $"Error: {ex.Message}"
        });
    }
});

// Database initialization
async Task InitializeDatabase(AdminDbContext context)
{
    try
    {
        // Create tables if they don't exist
        await context.Database.EnsureCreatedAsync();
        Console.WriteLine("Database initialized successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization error: {ex.Message}");
    }
}

// Seed data - ADD CONTACTS TABLE CHECK
async Task SeedDataAsync(AdminDbContext context)
{
    // Check if Contacts table exists and is accessible
    try
    {
        var contactsCount = await context.Contacts.CountAsync();
        Console.WriteLine($"Contacts table exists with {contactsCount} records");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Contacts table error: {ex.Message}");
    }

    if (!context.Events.Any())
    {
        context.Events.AddRange(
            new Event
            {
                Title = "Lets plan your memorable moment at Sam Sound & Light",
                Date = "Sat, 29 June",
                Detail = "Event by Sam Sound & Lights",
                Image = "/img/event1.jpg",
                ButtonText = "Learn More",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Event
            {
                Title = "Steppin Out 1st Anniversary Competition",
                Date = "Sat, 19 Nov",
                Detail = "Event by Karabaw Martial Arts & Fitness Centre",
                Image = "/img/event2.jpg",
                ButtonText = "Learn More",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );

        await context.SaveChangesAsync();
        Console.WriteLine("Events seeded!");
    }
}

// Apply database initialization
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
    try
    {
        Console.WriteLine("Initializing database...");
        await InitializeDatabase(dbContext);
        await SeedDataAsync(dbContext);
        Console.WriteLine("Database initialization completed!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database error: {ex.Message}");
    }
}

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://0.0.0.0:{port}");
Console.WriteLine($"Application starting on port: {port}");

app.Run();