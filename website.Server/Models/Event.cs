using System.ComponentModel.DataAnnotations;

namespace website.Server.Models
{
    public class Event
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Date { get; set; } = string.Empty;

        public string Detail { get; set; } = string.Empty;

        public string Image { get; set; } = string.Empty;

        public string ButtonText { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}