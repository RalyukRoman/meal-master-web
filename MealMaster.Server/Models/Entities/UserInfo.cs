using MealMaster.Server.Data;

namespace MealMaster.Server.Models.Entities
{
    public class UserInfo
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Biography { get; set; }
        public DateOnly? Birthday { get; set; }
        public string? ImgPath { get; set; }

        public required string UserId { get; set; }
        public ProgramUser? User { get; set; }

        public List<Comment> Comments { get; set; } = [];
        public List<Rating> Ratings { get; set; } = [];
        public List<Recipe> Recipes { get; set; } = [];
    }
}
