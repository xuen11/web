using System;

namespace website.Server.Models
{
    public class PortfolioImage
    {
        public int Id { get; set; }
        public string ImagePath { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
