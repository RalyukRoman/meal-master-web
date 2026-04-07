using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class IngredientDto
    {
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        public List<int> UnitIds { get; set; } = [];
    }
}
