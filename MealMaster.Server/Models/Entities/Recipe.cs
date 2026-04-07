namespace MealMaster.Server.Models.Entities
{
    public class Recipe
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string Instructions { get; set; }
        public required DateOnly CreatedAt { get; set; }
        public string? ImgPath { get; set; }

        public UserInfo? UserInfo { get; set; }
        public int UserInfoId { get; set; }

        public List<RecipeIngredient> RecipesIngredients { get; set; } = [];
        public List<Game> Games { get; set; } = [];
        public List<Comment> Comments { get; set; } = [];
        public List<Rating> Ratings { get; set; } = [];
    }
}
