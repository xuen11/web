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

        public PortfolioController(AdminDbContext context)
        {
            _context = context;
            // Remove IWebHostEnvironment dependency since we're not saving files
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
                // Return empty array on error
                return Ok(new List<object>());
            }
        }

        // POST: api/portfolio (optional - if you want to add single items via form)
        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> Upload([FromForm] IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No file uploaded");

            var fileName = Path.GetFileName(image.FileName);
            var savePath = Path.Combine("wwwroot/portfolio", fileName);

            Directory.CreateDirectory("wwwroot/portfolio");

            using (var stream = new FileStream(savePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            // Save image path like: /portfolio/filename.jpg
            var portfolio = new Portfolio
            {
                ImagePath = "/portfolio/" + fileName
            };

            _context.Portfolios.Add(portfolio);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, path = portfolio.ImagePath });
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

                // No need to delete physical file since we're only storing URLs
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

        // POST: api/portfolio/update-all (Bulk update like Events)
        [HttpPost("update-all")]
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
    }

    public class PortfolioInputModel
    {
        public int id { get; set; }
        public string imagePath { get; set; } = string.Empty;
        public DateTime? createdAt { get; set; }
        public DateTime? updatedAt { get; set; }
    }
}