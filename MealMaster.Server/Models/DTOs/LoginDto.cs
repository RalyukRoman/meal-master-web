using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class LoginDto
    {
        [Required]
        [MaxLength(50)]
        public required string Login { get; set; }

        [Required]
        [MaxLength(50)]
        public required string Password { get; set; }
    }
}
