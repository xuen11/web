using Microsoft.AspNetCore.Mvc;
using website.Server.Data;
using website.Server.Models;
using System.Text.RegularExpressions;

namespace website.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly AdminDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ServiceController(AdminDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var services = _context.Services.OrderByDescending(s => s.CreatedAt).ToList();

            var result = services.Select(s => new
            {
                id = s.Id,
                title = s.Title,
                imagePath = s.ImagePath,
                createdAt = s.CreatedAt,
                updatedAt = s.UpdatedAt
            });

            return Ok(result);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload([FromForm] string Title, [FromForm] IFormFile image)
        {
            try
            {
                _logger.LogInformation("=== UPLOAD DEBUG ===");
                _logger.LogInformation($"WebRootPath: {_env.WebRootPath}")
                if (string.IsNullOrWhiteSpace(Title))
                    return BadRequest(new { success = false, message = "Title is required" });

                if (image == null || image.Length == 0)
                    return BadRequest(new { success = false, message = "No file uploaded" });

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest(new { success = false, message = "Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed." });

                // Validate file size (5MB max)
                const long maxFileSize = 5 * 1024 * 1024;
                if (image.Length > maxFileSize)
                    return BadRequest(new { success = false, message = "File size exceeds 5MB limit." });

                // Get original filename and make it safe
                string originalFileName = Path.GetFileName(image.FileName);
                string safeFileName = MakeFileNameSafe(originalFileName);

                // Save in wwwroot/img/ 
                string folder = Path.Combine(_env.WebRootPath, "img");
                Directory.CreateDirectory(folder);

                string filePath = Path.Combine(folder, safeFileName);
                _logger.LogInformation($"Full file path: {filePath}");

                // Add number suffix if file already exists
                int counter = 1;
                string fileNameWithoutExt = Path.GetFileNameWithoutExtension(safeFileName);
                string extension = Path.GetExtension(safeFileName);

                while (System.IO.File.Exists(filePath))
                {
                    safeFileName = $"{fileNameWithoutExt}_{counter}{extension}";
                    filePath = Path.Combine(folder, safeFileName);
                    counter++;
                }

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                _logger.LogInformation($"File saved successfully to: {filePath}");


                // Store as ./img/filename.jpg in DB
                var service = new Service
                {
                    Title = Title.Trim(),
                    ImagePath = $"./img/{safeFileName}", // THIS IS THE IMPORTANT LINE
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _logger.LogInformation($"Saving to DB with ImagePath: {service.ImagePath}");

                _context.Services.Add(service);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Service created successfully",
                    service = new
                    {
                        id = service.Id,
                        title = service.Title,
                        imagePath = service.ImagePath, // Will be ./img/filename.jpg
                        createdAt = service.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error: {ex.Message}"
                });
            }
        }

        [HttpPut("{id}")]
        [DisableRequestSizeLimit]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] string Title, [FromForm] IFormFile image)
        {
            try
            {
                var service = _context.Services.Find(id);
                if (service == null)
                    return NotFound(new { success = false, message = "Service not found." });

                if (!string.IsNullOrWhiteSpace(Title))
                    service.Title = Title.Trim();

                if (image != null && image.Length > 0)
                {
                    // Validate file type
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                    var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
                    if (!allowedExtensions.Contains(fileExtension))
                        return BadRequest(new { success = false, message = "Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed." });

                    // Validate file size
                    const long maxFileSize = 5 * 1024 * 1024;
                    if (image.Length > maxFileSize)
                        return BadRequest(new { success = false, message = "File size exceeds 5MB limit." });

                    // Delete old image
                    if (!string.IsNullOrEmpty(service.ImagePath) && service.ImagePath.StartsWith("./img/"))
                    {
                        string oldFileName = service.ImagePath.Replace("./img/", "");
                        string oldFilePath = Path.Combine(_env.WebRootPath, "img", oldFileName);
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            try { System.IO.File.Delete(oldFilePath); }
                            catch { }
                        }
                    }

                    // Get original filename and make it safe
                    string originalFileName = Path.GetFileName(image.FileName);
                    string safeFileName = MakeFileNameSafe(originalFileName);

                    // Save new image to img folder
                    string folder = Path.Combine(_env.WebRootPath, "img");
                    Directory.CreateDirectory(folder);

                    string filePath = Path.Combine(folder, safeFileName);

                    // Add number suffix if file already exists
                    int counter = 1;
                    string fileNameWithoutExt = Path.GetFileNameWithoutExtension(safeFileName);
                    string extension = Path.GetExtension(safeFileName);

                    while (System.IO.File.Exists(filePath))
                    {
                        safeFileName = $"{fileNameWithoutExt}_{counter}{extension}";
                        filePath = Path.Combine(folder, safeFileName);
                        counter++;
                    }

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }

                    service.ImagePath = $"./img/{safeFileName}";
                }

                service.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Service updated successfully",
                    service = new
                    {
                        id = service.Id,
                        title = service.Title,
                        imagePath = service.ImagePath,
                        updatedAt = service.UpdatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error: {ex.Message}"
                });
            }
        }

        

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var service = _context.Services.Find(id);
                if (service == null)
                    return NotFound(new { success = false, message = "Service not found." });

                // Delete image from img folder
                if (!string.IsNullOrEmpty(service.ImagePath) && service.ImagePath.StartsWith("./img/"))
                {
                    string fileName = service.ImagePath.Replace("./img/", "");
                    string filePath = Path.Combine(_env.WebRootPath, "img", fileName);

                    if (System.IO.File.Exists(filePath))
                    {
                        try { System.IO.File.Delete(filePath); }
                        catch { }
                    }
                }

                _context.Services.Remove(service);
                _context.SaveChanges();

                return Ok(new
                {
                    success = true,
                    message = "Service deleted successfully",
                    deletedId = id
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error: {ex.Message}"
                });
            }
        }

        // Helper method to make filename safe but keep original name
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