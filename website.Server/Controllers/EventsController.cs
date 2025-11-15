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

        // GET: api/events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            try
            {
                Console.WriteLine("GET Events request received");
                var events = await _context.Events.ToListAsync();

                // Get full base URL dynamically
                var request = _httpContextAccessor.HttpContext?.Request;
                var baseUrl = $"{request?.Scheme}://{request?.Host}";

                // Update image paths to full URLs
                var eventsWithFullImageUrl = events.Select(e =>
                {
                    if (!string.IsNullOrEmpty(e.Image))
                    {
                        if (!e.Image.StartsWith("http"))
                        {
                            e.Image = $"{baseUrl}/{e.Image.TrimStart('/')}";
                        }
                    }
                    else
                    {
                        e.Image = $"{baseUrl}/img/default-event.jpg"; // fallback default
                    }
                    return e;
                }).ToList();

                Console.WriteLine($"Returning {eventsWithFullImageUrl.Count} events");
                return Ok(eventsWithFullImageUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting events: {ex.Message}");
                return Ok(new List<Event>());
            }
        }

        // POST: api/events/update-all
        [HttpPost("update-all")]
        public async Task<ActionResult> UpdateAllEvents([FromBody] List<Event> events)
        {
            try
            {
                Console.WriteLine($"POST UpdateAllEvents received: {events?.Count} events");

                if (events == null)
                {
                    Console.WriteLine("No events data received");
                    return BadRequest(new { success = false, message = "Events data is required" });
                }

                // Clear existing events
                var existingEvents = await _context.Events.ToListAsync();
                Console.WriteLine($"Clearing {existingEvents.Count} existing events");
                _context.Events.RemoveRange(existingEvents);

                // Add new events
                foreach (var eventItem in events)
                {
                    // Reset ID to let database generate new ones
                    eventItem.Id = 0;
                    eventItem.CreatedAt = DateTime.UtcNow;
                    eventItem.UpdatedAt = DateTime.UtcNow;
                    _context.Events.Add(eventItem);
                    Console.WriteLine($"Adding event: {eventItem.Title}");
                }

                await _context.SaveChangesAsync();
                Console.WriteLine("Events saved successfully");

                return Ok(new
                {
                    success = true,
                    message = "Events updated successfully",
                    events = events
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving events: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error saving events: {ex.Message}"
                });
            }
        }
    }
}
