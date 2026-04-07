using System.ComponentModel.DataAnnotations;

namespace MealMaster.Server.Models.DTOs
{
    public class CommentDto
    {
        [Required]
        [MaxLength(250)]
        public required string Text { get; set; }

        public int RecipeId { get; set; }
    }
}
