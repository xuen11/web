using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using website.Server.Data;
using website.Server.Models;
using System;
using System.Threading.Tasks;

namespace website.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly AdminDbContext _context; 

        public ContactController(AdminDbContext context) 
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitContactForm([FromBody] Contact contact)
        {
            Console.WriteLine($"Received contact form: {contact.FullName}, {contact.Email}");

            if (contact == null)
            {
                return BadRequest(new { success = false, message = "Invalid data received" });
            }

            if (string.IsNullOrEmpty(contact.FullName) || string.IsNullOrEmpty(contact.Email) || string.IsNullOrEmpty(contact.EventDetails))
            {
                return BadRequest(new { success = false, message = "All required fields must be filled" });
            }

            try
            {
                contact.CreatedAt = DateTime.Now;

                Console.WriteLine("Attempting to save contact to database...");

                _context.Contacts.Add(contact);
                await _context.SaveChangesAsync();

                Console.WriteLine("Contact saved successfully");

                return Ok(new
                {
                    success = true,
                    message = "Thank you for your message! We'll get back to you soon."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== DATABASE ERROR ===");
                Console.WriteLine($"Error Type: {ex.GetType().Name}");
                Console.WriteLine($"Error Message: {ex.Message}");

                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }

                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                Console.WriteLine($"=== END ERROR ===");

                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while saving your message. Please try again."
                });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetContacts()
        {
            try
            {
                var contacts = await _context.Contacts
                    .OrderByDescending(c => c.CreatedAt)
                    .ToListAsync();
                return Ok(contacts);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting contacts: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving contacts" });
            }
        }

        [HttpGet("check-table")]
        public async Task<IActionResult> CheckTableExists()
        {
            try
            {
                var tableExists = await _context.Contacts.AnyAsync();
                return Ok(new
                {
                    tableExists = true,
                    message = "Contacts table exists and is accessible",
                    count = await _context.Contacts.CountAsync()
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    tableExists = false,
                    message = $"Contacts table error: {ex.Message}"
                });
            }
        }
    }
}