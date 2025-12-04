using Microsoft.AspNetCore.Mvc;
using website.Server.Data;
using website.Server.Models;

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
                imagePath = s.ImagePath, // already stored as /uploads/services/filename.jpg
                createdAt = s.CreatedAt,
                updatedAt = s.UpdatedAt
            });

            return Ok(result);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromForm] string Title, [FromForm] IFormFile image)
        {
            if (string.IsNullOrWhiteSpace(Title))
                return BadRequest("Title is required");

            if (image == null || image.Length == 0)
                return BadRequest("No file uploaded");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.");

            // Validate file size (5MB max)
            const long maxFileSize = 5 * 1024 * 1024;
            if (image.Length > maxFileSize)
                return BadRequest("File size exceeds 5MB limit.");

            // Generate unique filename
            string uniqueFileName = Guid.NewGuid().ToString() + fileExtension;

            // Save in wwwroot/uploads/services/
            string folder = Path.Combine(_env.WebRootPath, "uploads", "services");
            Directory.CreateDirectory(folder); // Ensure folder exists
            string filePath = Path.Combine(folder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Store relative path in DB
            var service = new Service
            {
                Title = Title.Trim(),
                ImagePath = $"uploads/services/{uniqueFileName}", // relative path
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

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
                    imagePath = service.ImagePath,
                    createdAt = service.CreatedAt
                }
            });
        }

        [HttpPut("{id}")]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Update(int id, [FromForm] string Title, [FromForm] IFormFile image)
        {
            var service = _context.Services.Find(id);
            if (service == null)
                return NotFound("Service not found.");

            if (!string.IsNullOrWhiteSpace(Title))
                service.Title = Title.Trim();

            if (image != null && image.Length > 0)
            {
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.");

                const long maxFileSize = 5 * 1024 * 1024;
                if (image.Length > maxFileSize)
                    return BadRequest("File size exceeds 5MB limit.");

                // Delete old image
                if (!string.IsNullOrEmpty(service.ImagePath))
                    DeleteOldImage(service.ImagePath);

                // Save new image
                string uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
                string folder = Path.Combine(_env.WebRootPath, "uploads", "services");
                Directory.CreateDirectory(folder);
                string filePath = Path.Combine(folder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }

                service.ImagePath = $"uploads/services/{uniqueFileName}";
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

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var service = _context.Services.Find(id);
            if (service == null)
                return NotFound("Service not found.");

            if (!string.IsNullOrEmpty(service.ImagePath))
                DeleteOldImage(service.ImagePath);

            _context.Services.Remove(service);
            _context.SaveChanges();

            return Ok(new
            {
                success = true,
                message = "Service deleted successfully",
                deletedId = id
            });
        }

        private void DeleteOldImage(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
                return;

            string filePath = Path.Combine(_env.WebRootPath, imagePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

            if (System.IO.File.Exists(filePath))
            {
                try { System.IO.File.Delete(filePath); }
                catch { /* Log error if needed */ }
            }
        }
    }
}
