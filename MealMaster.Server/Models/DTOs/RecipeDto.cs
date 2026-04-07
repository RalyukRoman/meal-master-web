using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class RecipeDto
    {
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        public string? Description { get; set; }

        [Required]
        public required string Instructions { get; set; }

        [Required]
        public required DateOnly CreatedAt { get; set; }

        public List<int> GameIds { get; set; } = [];
        public List<RecipeIngredientDto> RecipesIngredients { get; set; } = [];
    }
}
