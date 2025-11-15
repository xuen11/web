using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;

namespace website.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly AdminDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EventsController(AdminDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            var events = await _context.Events.ToListAsync();
            var request = _httpContextAccessor.HttpContext?.Request;
            var baseUrl = $"{request?.Scheme}://{request?.Host}";

            var updated = events.Select(e =>
            {
                if (string.IsNullOrEmpty(e.Image))
                    e.Image = $"{baseUrl}/img/default-event.jpg";
                else if (!e.Image.StartsWith("http"))
                    e.Image = $"{baseUrl}/{e.Image.TrimStart('/')}";
                return e;
            }).ToList();

            return Ok(updated);
        }

        [HttpPost("update-all")]
        public async Task<ActionResult> UpdateAllEvents([FromBody] List<Event> events)
        {
            if (events == null) return BadRequest(new { success = false, message = "Events data is required" });

            var existing = await _context.Events.ToListAsync();
            _context.Events.RemoveRange(existing);

            foreach (var e in events)
            {
                e.Id = 0;
                e.CreatedAt = DateTime.UtcNow;
                e.UpdatedAt = DateTime.UtcNow;
                _context.Events.Add(e);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Events updated successfully", events });
        }
    }
}
