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
        public async Task<ActionResult<IEnumerable<object>>> GetEvents()
        {
            try
            {
                var events = await _context.Events.ToListAsync();

                var response = events.Select(e => new
                {
                    id = e.Id,
                    title = e.Title,
                    date = e.Date,
                    detail = e.Detail,
                    image = e.Image,
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return Ok(new List<object>());
            }
        }

        // POST: api/events/update-all
        [HttpPost("update-all")]
        public async Task<ActionResult> UpdateAllEvents([FromBody] List<EventInputModel> events)
        {
            try
            {
                if (events == null)
                {
                    return BadRequest(new { success = false, message = "Events data is required" });
                }

                var existingEvents = await _context.Events.ToListAsync();
                _context.Events.RemoveRange(existingEvents);

                foreach (var eventItem in events)
                {
                    var newEvent = new Event
                    {
                        Title = eventItem.title,
                        Date = eventItem.date,
                        Detail = eventItem.detail,
                        Image = eventItem.image,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Events.Add(newEvent);
                }

                await _context.SaveChangesAsync();

                var updatedEvents = await _context.Events.ToListAsync();
                var response = updatedEvents.Select(e => new
                {
                    id = e.Id,
                    title = e.Title,
                    date = e.Date,
                    detail = e.Detail,
                    image = e.Image,
                }).ToList();

                return Ok(new
                {
                    success = true,
                    message = "Events updated successfully",
                    events = response
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

    public class EventInputModel
    {
        public int id { get; set; }
        public string title { get; set; } = string.Empty;
        public string date { get; set; } = string.Empty;
        public string detail { get; set; } = string.Empty;
        public string image { get; set; } = string.Empty;
        public string buttonText { get; set; } = string.Empty;
    }
}