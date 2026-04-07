using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class GameDto
    {
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        public string? Description { get; set; }
    }
}
