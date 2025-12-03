using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;

namespace website.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly AdminDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ServiceController(AdminDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/service
        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            var services = await _context.Services.ToListAsync();
            return Ok(services);
        }

        // POST: api/service
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateService([FromForm] string Title, [FromForm] IFormFile Image)
        {
            if (string.IsNullOrWhiteSpace(Title))
                return BadRequest(new { error = "Title is required" });

            if (Image == null || Image.Length == 0)
                return BadRequest(new { error = "Image file is required" });

            // Save file
            var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "services");
            Directory.CreateDirectory(uploadsPath);

            var fileName = Guid.NewGuid() + Path.GetExtension(Image.FileName);
            var filePath = Path.Combine(uploadsPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await Image.CopyToAsync(stream);
            }

            // Save service to database
            var service = new Service
            {
                Title = Title,
                ImagePath = "/uploads/services/" + fileName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Service created successfully",
                id = service.Id,
                title = service.Title,
                imagePath = service.ImagePath
            });
        }

        // PUT: api/service/{id}
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateService(int id, [FromForm] string Title, [FromForm] IFormFile Image)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound(new { error = "Service not found" });

            if (!string.IsNullOrWhiteSpace(Title))
                service.Title = Title;

            if (Image != null && Image.Length > 0)
            {
                // Delete old image
                if (!string.IsNullOrEmpty(service.ImagePath))
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath, service.ImagePath.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                        System.IO.File.Delete(oldFilePath);
                }

                // Save new image
                var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", "services");
                Directory.CreateDirectory(uploadsPath);

                var fileName = Guid.NewGuid() + Path.GetExtension(Image.FileName);
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await Image.CopyToAsync(stream);
                }

                service.ImagePath = "/uploads/services/" + fileName;
            }

            service.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Service updated successfully",
                id = service.Id,
                title = service.Title,
                imagePath = service.ImagePath
            });
        }

        // DELETE: api/service/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
                return NotFound(new { error = "Service not found" });

            // Delete physical file
            if (!string.IsNullOrEmpty(service.ImagePath))
            {
                var filePath = Path.Combine(_environment.WebRootPath, service.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Service deleted successfully" });
        }
    }
}
