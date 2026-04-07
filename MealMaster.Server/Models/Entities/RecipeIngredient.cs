using System.ComponentModel.DataAnnotations.Schema;

namespace MealMaster.Server.Models.Entities
{
    public class RecipeIngredient
    {
        public decimal Quantity { get; set; }

        public Unit? Unit { get; set; }
        public int UnitId { get; set; }

        [ForeignKey(nameof(RecipeId))]
        public Recipe? Recipe { get; set; }
        public int RecipeId { get; set; }

        [ForeignKey(nameof(IngredientId))]
        public Ingredient? Ingredient { get; set; }
        public int IngredientId { get; set; }
    }
}
