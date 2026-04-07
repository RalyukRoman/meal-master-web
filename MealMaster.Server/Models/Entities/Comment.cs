namespace MealMaster.Server.Models.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public required string Text { get; set; }

        public UserInfo? UserInfo { get; set; }
        public int UserInfoId { get; set; }

        public Recipe? Recipe { get; set; }
        public int RecipeId { get; set; }
    }
}
