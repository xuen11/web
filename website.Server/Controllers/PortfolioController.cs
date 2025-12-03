using Microsoft.AspNetCore.Mvc;
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

        public PortfolioController(AdminDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/portfolio
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_context.Portfolios.ToList());
        }

        // POST: api/portfolio
        [HttpPost]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads/services");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // KEEP ORIGINAL FILENAME
            var originalFileName = Path.GetFileName(file.FileName);

            // SAFE FILENAME (remove dangerous chars)
            originalFileName = originalFileName.Replace(" ", "_");

            string filePath = Path.Combine(uploadsFolder, originalFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var portfolio = new Portfolio
            {
                ImagePath = $"/uploads/services/{originalFileName}",
                CreatedBy = "admin",
                UpdatedBy = "admin",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Portfolios.Add(portfolio);
            await _context.SaveChangesAsync();

            return Ok(portfolio);
        }


        // DELETE: api/portfolio/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var item = _context.Portfolios.Find(id);
            if (item == null)
                return NotFound("Portfolio item not found.");

            // Delete the file
            var filePath = Path.Combine(_env.WebRootPath, item.ImagePath);
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _context.Portfolios.Remove(item);
            _context.SaveChanges();

            return Ok("Deleted successfully");
        }
    }
}
