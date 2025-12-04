using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;

namespace website.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        private readonly AdminDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<PortfolioController> _logger;

        public PortfolioController(AdminDbContext context, IWebHostEnvironment env, ILogger<PortfolioController> logger)
        {
            _context = context;
            _env = env;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var portfolios = await _context.Portfolios.ToListAsync();
                return Ok(portfolios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting portfolios");
                return StatusCode(500, new { error = "Error getting portfolio items" });
            }
        }

        [HttpPost]
        [RequestSizeLimit(10_485_760)] // 10MB limit
        [RequestFormLimits(MultipartBodyLengthLimit = 10_485_760)] // 10MB limit
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] IFormFile image)
        {
            try
            {
                _logger.LogInformation("Upload attempt received");

                if (image == null || image.Length == 0)
                    return BadRequest(new { success = false, message = "No file uploaded" });

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp" };
                var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();

                if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Invalid file type. Allowed: {string.Join(", ", allowedExtensions)}"
                    });
                }

                // Validate file size (5MB max)
                const long maxFileSize = 5 * 1024 * 1024; // 5MB
                if (image.Length > maxFileSize)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"File size exceeds 5MB limit. Current: {image.Length / 1024 / 1024}MB"
                    });
                }

                // Generate unique filename to avoid collisions
                string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
                _logger.LogInformation($"Generated filename: {uniqueFileName}");

                // Create uploads directory if it doesn't exist
                string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    _logger.LogInformation($"Created uploads directory: {uploadsFolder}");
                }

                // Save file
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);
                _logger.LogInformation($"Saving to: {filePath}");

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                _logger.LogInformation($"File saved successfully: {filePath}");

                // Store in database
                var portfolio = new Portfolio
                {
                    ImagePath = $"uploads/{uniqueFileName}", // Store relative path
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Portfolios.Add(portfolio);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Database record created with ID: {portfolio.Id}");

                return Ok(new
                {
                    success = true,
                    message = "Image uploaded successfully",
                    portfolio = new
                    {
                        id = portfolio.Id,
                        imagePath = portfolio.ImagePath,
                        createdAt = portfolio.CreatedAt,
                        updatedAt = portfolio.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading portfolio image");
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error uploading image: {ex.Message}"
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var item = await _context.Portfolios.FindAsync(id);
                if (item == null)
                    return NotFound(new { success = false, message = "Portfolio item not found." });

                // Delete file if it exists
                if (!string.IsNullOrEmpty(item.ImagePath))
                {
                    var filePath = Path.Combine(_env.WebRootPath, item.ImagePath);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                        _logger.LogInformation($"Deleted file: {filePath}");
                    }
                }

                _context.Portfolios.Remove(item);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting portfolio item");
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error deleting item: {ex.Message}"
                });
            }
        }

        // Optional bulk update endpoint
        [HttpPost("update-all")]
        public async Task<IActionResult> UpdateAll([FromBody] List<Portfolio> portfolios)
        {
            try
            {
                if (portfolios == null || !portfolios.Any())
                    return BadRequest(new { success = false, message = "No data provided" });

                // Clear existing
                var existing = await _context.Portfolios.ToListAsync();
                _context.Portfolios.RemoveRange(existing);

                // Add new items
                foreach (var item in portfolios)
                {
                    item.UpdatedAt = DateTime.UtcNow;
                    if (item.CreatedAt == default)
                        item.CreatedAt = DateTime.UtcNow;
                }

                await _context.Portfolios.AddRangeAsync(portfolios);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Portfolio updated successfully",
                    count = portfolios.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating all portfolios");
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error updating portfolio: {ex.Message}"
                });
            }
        }
    }
}