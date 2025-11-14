using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Get connection string
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DefaultConnection")
    ?? throw new Exception("No database connection found. Please set DefaultConnection.");

Console.WriteLine($"Using MySQL connection: {connectionString}");

// Add DbContext with MySQL
builder.Services.AddDbContext<AdminDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("https://web-kohl-three-21.vercel.app", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("FrontendPolicy");
app.UseAuthorization();

app.MapControllers();

// Health check endpoints
app.MapGet("/", () => "Backend API is running!");
app.MapGet("/health", () => Results.Json(new { status = "Healthy", timestamp = DateTime.UtcNow }));

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
            events = events.Select(e => new
            {
                e.Id,
                e.Title,
                e.Date,
                e.Image,
                e.Detail,
                e.ButtonText,
                e.CreatedAt,
                e.UpdatedAt
            })
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, error = ex.Message });
    }
});

// Contact endpoint
app.MapPost("/api/contact", async (Contact contact, HttpContext httpContext) =>
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

// Initialize database and seed data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
    try
    {
        await dbContext.Database.EnsureCreatedAsync();
        Console.WriteLine("Database initialized successfully!");

        // Seed sample data if no events exist
        if (!dbContext.Events.Any())
        {
            dbContext.Events.AddRange(
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
            await dbContext.SaveChangesAsync();
            Console.WriteLine("Sample events seeded!");
        }
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