using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class UnitDto
    {
        [Required]
        [MaxLength(50)]
        public required string Code { get; set; }
    }
}
