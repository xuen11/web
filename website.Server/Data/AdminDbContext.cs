using Microsoft.EntityFrameworkCore;
using website.Server.Models;

namespace website.Server.Data
{
    public class AdminDbContext : DbContext
    {
        public AdminDbContext(DbContextOptions<AdminDbContext> options) : base(options)
        {
        }

        public DbSet<StaffAccount> StaffAccounts { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<Contact> Contacts { get; set; } // ADD THIS LINE

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure StaffAccount
            modelBuilder.Entity<StaffAccount>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
            });

            // Configure Banner
            modelBuilder.Entity<Banner>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
            });

            // Configure Contact - ADD THIS CONFIGURATION
            modelBuilder.Entity<Contact>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Phone).HasMaxLength(20);
                entity.Property(e => e.EventDetails).IsRequired();
            });

            // Seed staff accounts
            modelBuilder.Entity<StaffAccount>().HasData(
                new StaffAccount
                {
                    Id = 1,
                    Email = "staff@gmail.com",
                    Password = "staff123",
                    Role = "staff",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new StaffAccount
                {
                    Id = 2,
                    Email = "admin@gmail.com",
                    Password = "admin123",
                    Role = "admin",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );

            // Seed initial banner
            modelBuilder.Entity<Banner>().HasData(
                new Banner
                {
                    Id = 1,
                    Title = "Elevate Your Event Experience",
                    Subtitle = "Explore our exclusive Golden and Platinum Packages designed to make your event truly unforgettable.",
                    ImagePath = "uploads/default-banner.jpg",
                    UpdatedAt = DateTime.UtcNow
                }
            );
        }
    }
}