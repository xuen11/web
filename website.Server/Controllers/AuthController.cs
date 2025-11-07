using Microsoft.AspNetCore.Mvc;
using website.Server.Models;

namespace website.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly List<StaffAccount> _staffAccounts = new()
        {
            new StaffAccount { Id = 1, Email = "staff@gmail.com", Password = "staff123", Role = "staff" },
            new StaffAccount { Id = 2, Email = "admin@gmail.com", Password = "admin123", Role = "admin" }
        };

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            Console.WriteLine($"Login attempt for: {request.Email}");

            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new LoginResponse
                {
                    Success = false,
                    Message = "Email and password are required"
                });
            }

            var staff = _staffAccounts.FirstOrDefault(a =>
                a.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase) &&
                a.Password == request.Password);

            if (staff == null)
            {
                Console.WriteLine("Invalid credentials");
                return Unauthorized(new LoginResponse
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            var simpleToken = $"simple-token-{staff.Id}-{DateTime.Now.Ticks}";

            Console.WriteLine($"Login successful for: {staff.Email}");

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
    }
}