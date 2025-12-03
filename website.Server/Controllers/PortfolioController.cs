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
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromForm] IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsDir = Path.Combine(_env.WebRootPath, "uploads");

            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            string fileName = $"{Guid.NewGuid()}_{image.FileName}";
            string filePath = Path.Combine(uploadsDir, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Create DB record
            var portfolio = new Portfolio
            {
                ImagePath = $"/uploads/{fileName}",
                CreatedBy = "system",
                UpdatedBy = "system",
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
