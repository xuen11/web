using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;

namespace website.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BannerController : ControllerBase
    {
        private readonly AdminDbContext _context;

        public BannerController(AdminDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBanner()
        {
            try
            {
                Console.WriteLine("GET Banner request received");
                var banner = await _context.Banners.FirstOrDefaultAsync();
                if (banner == null)
                {
                    Console.WriteLine("No banner found in database");
                    return NotFound(new { message = "Banner not found" });
                }

                Console.WriteLine($"Banner loaded - Title: {banner.Title}, Image: {banner.ImagePath}");
                return Ok(banner);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading banner: {ex.Message}");
                return StatusCode(500, new { message = "Error loading banner" });
            }
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateBanner([FromForm] BannerUpdateModel model)
        {
            try
            {
                Console.WriteLine("POST Banner update request received");
                Console.WriteLine($"Received - Title: '{model.Title}', Subtitle: '{model.Subtitle}'");
                Console.WriteLine($"Image: {(model.Image != null ? model.Image.FileName : "No image")}");

                var banner = await _context.Banners.FirstOrDefaultAsync();
                if (banner == null)
                {
                    Console.WriteLine("No banner found to update");
                    return NotFound(new { success = false, message = "Banner not found" });
                }

                // Update title and subtitle
                if (!string.IsNullOrEmpty(model.Title))
                {
                    banner.Title = model.Title;
                    Console.WriteLine($"Updated title to: {banner.Title}");
                }

                if (!string.IsNullOrEmpty(model.Subtitle))
                {
                    banner.Subtitle = model.Subtitle;
                    Console.WriteLine($"Updated subtitle to: {banner.Subtitle}");
                }

                // Handle image upload
                if (model.Image != null && model.Image.Length > 0)
                {
                    Console.WriteLine($"Processing image upload: {model.Image.FileName} ({model.Image.Length} bytes)");

                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                    // Create uploads directory if it doesn't exist
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Console.WriteLine($"Creating uploads directory: {uploadsFolder}");
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    // Generate unique filename
                    var fileName = $"{Guid.NewGuid()}_{model.Image.FileName}";
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    Console.WriteLine($"Saving image to: {filePath}");

                    // Save the file
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await model.Image.CopyToAsync(stream);
                    }

                    banner.ImagePath = $"uploads/{fileName}";
                    Console.WriteLine($"Updated image path to: {banner.ImagePath}");
                }

                banner.UpdatedAt = DateTime.UtcNow;

                _context.Banners.Update(banner);
                await _context.SaveChangesAsync();

                Console.WriteLine("Banner successfully saved to database");

                return Ok(new
                {
                    success = true,
                    message = "Banner updated successfully",
                    banner = new
                    {
                        banner.Id,
                        banner.Title,
                        banner.Subtitle,
                        banner.ImagePath,
                        banner.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Banner update error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

                return BadRequest(new
                {
                    success = false,
                    message = $"Failed to update banner: {ex.Message}"
                });
            }
        }
    }

    public class BannerUpdateModel
    {
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }
}