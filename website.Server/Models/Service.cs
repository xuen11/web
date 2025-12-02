using System;

namespace website.Server.Models
{
    public class Service
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Image { get; set; } = null!;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
