using Microsoft.AspNetCore.Mvc;
using website.Server.Models;
using System.Linq;

namespace website.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly List<StaffAccount> _staffAccounts = new()
        {
            new StaffAccount
            {
                Id = 1,
                Email = "staff@gmail.com",
                Password = "staff123",
                Role = "staff"
            },
            new StaffAccount
            {
                Id = 2,
                Email = "admin@gmail.com",
                Password = "admin123",
                Role = "admin"
            }
        };

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                Console.WriteLine($"=== LOGIN ATTEMPT ===");
                Console.WriteLine($"Email: {request?.Email}");
                Console.WriteLine($"Password: {request?.Password}");
                Console.WriteLine($"Request Body: {System.Text.Json.JsonSerializer.Serialize(request)}");

                if (request == null)
                {
                    Console.WriteLine("Request is null");
                    return BadRequest(new LoginResponse
                    {
                        Success = false,
                        Message = "Request body is required"
                    });
                }

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    Console.WriteLine("Email or password is empty");
                    return BadRequest(new LoginResponse
                    {
                        Success = false,
                        Message = "Email and password are required"
                    });
                }

                // Trim and normalize email
                request.Email = request.Email.Trim().ToLower();

                Console.WriteLine($"Checking against {_staffAccounts.Count} accounts:");
                foreach (var account in _staffAccounts)
                {
                    Console.WriteLine($"  - {account.Email} (Role: {account.Role})");
                }

                var staff = _staffAccounts.FirstOrDefault(a =>
                    a.Email.Trim().ToLower().Equals(request.Email) &&
                    a.Password == request.Password
                );

                if (staff == null)
                {
                    Console.WriteLine("No matching account found");
                    return Unauthorized(new LoginResponse
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    });
                }

                var simpleToken = $"simple-token-{staff.Id}-{DateTime.Now.Ticks}";

                Console.WriteLine($"✅ LOGIN SUCCESSFUL: {staff.Email} (Role: {staff.Role})");
                Console.WriteLine($"Token: {simpleToken}");
                Console.WriteLine($"=== END LOGIN ===");

                return Ok(new LoginResponse
                {
                    Success = true,
                    Message = "Login successful",
                    Token = simpleToken,
                    User = new User
                    {
                        Id = staff.Id,
                        Email = staff.Email,
                        Role = staff.Role
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"LOGIN ERROR: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, new LoginResponse
                {
                    Success = false,
                    Message = "An internal error occurred"
                });
            }
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "Auth controller is working",
                accounts = _staffAccounts,
                timestamp = DateTime.UtcNow
            });
        }
    }
}