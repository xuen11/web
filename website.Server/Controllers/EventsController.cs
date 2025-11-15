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

        public EventsController(AdminDbContext context)
        {
            _context = context;
        }

        // GET: api/events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            try
            {
                var events = await _context.Events.ToListAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                // Return empty array if table doesn't exist yet
                return Ok(new List<Event>());
            }
        }

        // POST: api/events/update-all
        [HttpPost("update-all")]
        public async Task<ActionResult> UpdateAllEvents([FromBody] List<Event> events)
        {
            try
            {
                if (events == null)
                {
                    return BadRequest(new { success = false, message = "Events data is required" });
                }

                // Clear existing events
                var existingEvents = await _context.Events.ToListAsync();
                _context.Events.RemoveRange(existingEvents);

                // Add new events
                foreach (var eventItem in events)
                {
                    // Reset ID to let database generate new ones
                    eventItem.Id = 0;
                    eventItem.CreatedAt = DateTime.UtcNow;
                    eventItem.UpdatedAt = DateTime.UtcNow;
                    _context.Events.Add(eventItem);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Events updated successfully",
                    events = events
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error saving events: {ex.Message}"
                });
            }
        }
    }
}