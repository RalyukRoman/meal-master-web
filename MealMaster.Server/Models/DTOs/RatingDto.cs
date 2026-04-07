using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class RatingDto
    {
        [Required]
        public int RecipeId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Mark { get; set; }
    }
}
