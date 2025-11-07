using Microsoft.AspNetCore.Http;

namespace website.Server.Models
{
    public class BannerUpdateModel
    {
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }
}
