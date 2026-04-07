using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class UserInfoDto
    {
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        [MaxLength(250)]
        public string? Biography { get; set; }

        public DateOnly? Birthday { get; set; }
    }
}
