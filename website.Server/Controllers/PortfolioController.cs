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

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_context.Portfolios.ToList());
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromForm] IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No file uploaded");

            // Save original file name
            string fileName = Path.GetFileName(image.FileName)
                                .Replace(" ", "_")
                                .Replace("/", "")
                                .Replace("\\", "");

            // Save directly in wwwroot
            string folder = _env.WebRootPath; // wwwroot
            string filePath = Path.Combine(folder, fileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Store only filename in DB
            var portfolio = new Portfolio
            {
                ImagePath = fileName, // only filename
                CreatedBy = "system",
                UpdatedBy = "system",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Portfolios.Add(portfolio);
            await _context.SaveChangesAsync();

            return Ok(portfolio);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var item = _context.Portfolios.Find(id);
            if (item == null)
                return NotFound("Portfolio item not found.");

            var filePath = Path.Combine(_env.WebRootPath, item.ImagePath);

            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);

            _context.Portfolios.Remove(item);
            _context.SaveChanges();

            return Ok("Deleted successfully");
        }
    }
}
