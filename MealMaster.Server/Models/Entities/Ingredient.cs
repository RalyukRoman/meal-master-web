namespace MealMaster.Server.Models.Entities
{
    public class Ingredient
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? ImgPath { get; set; }

        public List<RecipeIngredient> RecipesIngredients { get; set; } = [];
        public List<Unit> Units { get; set; } = [];
    }
}
