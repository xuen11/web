using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.IO;
using website.Server.Data;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Create necessary directories - REMOVE uploads/services, only create img
var wwwrootPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(wwwrootPath);
Directory.CreateDirectory(Path.Combine(wwwrootPath, "img")); // ADD THIS LINE
Directory.CreateDirectory(Path.Combine(wwwrootPath, "uploads", "portfolio")); // Keep portfolio if needed

// Configure form options for file uploads
builder.Services.Configure<FormOptions>(o =>
{
    o.ValueLengthLimit = int.MaxValue;
    o.MultipartBodyLengthLimit = 1024L * 1024L * 20; // 20MB
    o.MultipartBoundaryLengthLimit = int.MaxValue;
    o.MultipartHeadersCountLimit = int.MaxValue;
    o.MultipartHeadersLengthLimit = int.MaxValue;
});

// Configure JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DefaultConnection");

builder.Services.AddDbContext<AdminDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// CORS - Allow everything
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("Content-Disposition"));
});

var app = builder.Build();

// Middleware - minimal and in correct order
app.UseCors();
app.UseStaticFiles();
app.UseRouting();
app.MapControllers();

// Serve uploaded files from img folder
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(wwwrootPath, "img")),
    RequestPath = "/img"
});

// Serve uploaded files from uploads/portfolio if needed
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(wwwrootPath, "uploads", "portfolio")),
    RequestPath = "/uploads/portfolio"
});

// Serve React app
var clientBuildPath = Path.Combine(Directory.GetCurrentDirectory(), "../website.client/build");
if (Directory.Exists(clientBuildPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(clientBuildPath),
        RequestPath = ""
    });
    app.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(clientBuildPath)
    });
}

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.Run($"http://0.0.0.0:{Environment.GetEnvironmentVariable("PORT") ?? "8080"}");