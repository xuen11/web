using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;

namespace website.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PortfolioController : ControllerBase
    {
        private readonly AdminDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public PortfolioController(AdminDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/portfolio
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetPortfolios()
        {
            try
            {
                var portfolios = await _context.Portfolios
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();

                var response = portfolios.Select(p => new
                {
                    id = p.Id,
                    imagePath = p.ImagePath,
                    createdAt = p.CreatedAt,
                    updatedAt = p.UpdatedAt
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return Ok(new List<object>());
            }
        }

        // POST: api/portfolio - For file upload (FormData)
        [HttpPost]
        [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
        [Consumes("multipart/form-data")] // Important: This tells ASP.NET to accept file uploads
        public async Task<ActionResult> UploadPortfolio([FromForm] IFormFile image)
        {
            try
            {
                if (image == null || image.Length == 0)
                {
                    return BadRequest(new { success = false, message = "No file uploaded" });
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed."
                    });
                }

                // Validate file size (5MB max)
                const long maxFileSize = 5 * 1024 * 1024;
                if (image.Length > maxFileSize)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "File size exceeds 5MB limit."
                    });
                }

                // Generate unique filename
                string uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

                // Save to wwwroot/uploads/portfolio
                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "portfolio");
                Directory.CreateDirectory(uploadsPath);

                var filePath = Path.Combine(uploadsPath, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Store relative path in database
                var portfolio = new Portfolio
                {
                    ImagePath = $"/uploads/portfolio/{uniqueFileName}", // Use forward slash for web path
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Portfolios.Add(portfolio);
                await _context.SaveChangesAsync();

                var response = new
                {
                    success = true,
                    message = "Portfolio image uploaded successfully",
                    portfolio = new
                    {
                        id = portfolio.Id,
                        imagePath = portfolio.ImagePath,
                        createdAt = portfolio.CreatedAt,
                        updatedAt = portfolio.UpdatedAt
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error uploading portfolio image: {ex.Message}"
                });
            }
        }

        // POST: api/portfolio/update-all - For bulk update with URLs (JSON)
        [HttpPost("update-all")]
        [Consumes("application/json")] // This accepts JSON
        public async Task<ActionResult> UpdateAllPortfolios([FromBody] List<PortfolioInputModel> portfolios)
        {
            try
            {
                if (portfolios == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Portfolio data is required"
                    });
                }

                // Clear existing portfolios
                var existingPortfolios = await _context.Portfolios.ToListAsync();
                _context.Portfolios.RemoveRange(existingPortfolios);

                // Add new portfolios
                foreach (var item in portfolios)
                {
                    var newPortfolio = new Portfolio
                    {
                        ImagePath = item.imagePath,
                        CreatedAt = item.createdAt ?? DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Portfolios.Add(newPortfolio);
                }

                await _context.SaveChangesAsync();

                // Return updated list
                var updatedPortfolios = await _context.Portfolios.ToListAsync();
                var response = updatedPortfolios.Select(p => new
                {
                    id = p.Id,
                    imagePath = p.ImagePath,
                    createdAt = p.CreatedAt,
                    updatedAt = p.UpdatedAt
                }).ToList();

                return Ok(new
                {
                    success = true,
                    message = "Portfolios updated successfully",
                    portfolios = response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error saving portfolios: {ex.Message}"
                });
            }
        }

        // DELETE: api/portfolio/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePortfolio(int id)
        {
            try
            {
                var portfolio = await _context.Portfolios.FindAsync(id);

                if (portfolio == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Portfolio item not found."
                    });
                }

                // Delete physical file if it exists and is in uploads folder
                if (!string.IsNullOrEmpty(portfolio.ImagePath) &&
                    portfolio.ImagePath.StartsWith("/uploads/portfolio/"))
                {
                    var relativePath = portfolio.ImagePath.TrimStart('/');
                    var filePath = Path.Combine(_environment.WebRootPath, relativePath);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                _context.Portfolios.Remove(portfolio);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Portfolio item deleted successfully",
                    deletedId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error deleting portfolio item: {ex.Message}"
                });
            }
        }
    }

    public class PortfolioInputModel
    {
        public int id { get; set; }
        public string imagePath { get; set; } = string.Empty;
        public DateTime? createdAt { get; set; }
        public DateTime? updatedAt { get; set; }
    }
}