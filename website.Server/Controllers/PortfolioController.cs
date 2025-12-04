using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;
using System.Text.RegularExpressions;

namespace website.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        private readonly AdminDbContext _context;
        private readonly IWebHostEnvironment _env;

        public PortfolioController(AdminDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Portfolios.ToListAsync());
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] IFormFile image)
        {
            try
            {
                if (image == null || image.Length == 0)
                    return BadRequest(new { success = false, message = "No file uploaded" });

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg" };
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
                const long maxFileSize = 5 * 1024 * 1024;
                if (image.Length > maxFileSize)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"File size exceeds 5MB limit. Current: {image.Length / 1024 / 1024}MB"
                    });
                }

                // Sanitize original filename
                string originalFileName = Path.GetFileName(image.FileName);
                string safeFileName = MakeFileNameSafe(originalFileName);

                // Check if file already exists in img folder
                string imgFolder = Path.Combine(_env.WebRootPath, "img");
                if (!Directory.Exists(imgFolder))
                {
                    Directory.CreateDirectory(imgFolder);
                }

                string filePath = Path.Combine(imgFolder, safeFileName);

                // If file exists, add a number suffix
                int counter = 1;
                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(safeFileName);
                string extension = Path.GetExtension(safeFileName);

                while (System.IO.File.Exists(filePath))
                {
                    safeFileName = $"{fileNameWithoutExt}_{counter}{extension}";
                    filePath = Path.Combine(imgFolder, safeFileName);
                    counter++;
                }

                // Save file to /img folder
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                // Store in database with path like ./img/filename.jpg
                var portfolio = new Portfolio
                {
                    ImagePath = $"./img/{safeFileName}", // Store as ./img/filename.jpg
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Portfolios.Add(portfolio);
                await _context.SaveChangesAsync();

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

                // Delete file if it exists in img folder
                if (!string.IsNullOrEmpty(item.ImagePath) && item.ImagePath.StartsWith("./img/"))
                {
                    // Extract filename from ./img/filename.jpg
                    string fileName = item.ImagePath.Replace("./img/", "");
                    var imgFolder = Path.Combine(_env.WebRootPath, "img");
                    var filePath = Path.Combine(imgFolder, fileName);

                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                _context.Portfolios.Remove(item);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error deleting item: {ex.Message}"
                });
            }
        }

        // Helper method to make filename safe
        private string MakeFileNameSafe(string fileName)
        {
            // Remove path characters
            fileName = Path.GetFileName(fileName);

            // Remove invalid characters
            string invalidChars = Regex.Escape(new string(Path.GetInvalidFileNameChars()));
            string invalidRegStr = string.Format(@"([{0}]*\.+$)|([{0}]+)", invalidChars);
            fileName = Regex.Replace(fileName, invalidRegStr, "_");

            // Replace spaces with underscores
            fileName = fileName.Replace(" ", "_");

            // Make lowercase
            fileName = fileName.ToLower();

            // Ensure it's not too long
            if (fileName.Length > 100)
            {
                string extension = Path.GetExtension(fileName);
                string nameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                nameWithoutExt = nameWithoutExt.Substring(0, Math.Min(95 - extension.Length, nameWithoutExt.Length));
                fileName = nameWithoutExt + extension;
            }

            return fileName;
        }
    }
}