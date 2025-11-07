// Models/Contact.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace website.Server.Models
{
    public class Contact
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        [Required]
        public string EventDetails { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; } = DateTime.Now;

    
    }
}