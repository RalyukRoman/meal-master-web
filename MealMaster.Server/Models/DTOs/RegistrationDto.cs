using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class RegistrationDto
    {
        [Required]
        [MaxLength(50)]
        public required string Email { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Login { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Password { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }
    }
}
