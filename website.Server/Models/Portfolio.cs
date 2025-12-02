using System.ComponentModel.DataAnnotations;

namespace website.Server.Models
{
    public class Portfolio
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImagePath { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
