using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class RecipeIngredientDto
    {
        [Required]
        public int IngredientId { get; set; }

        [Required]
        public int UnitId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
