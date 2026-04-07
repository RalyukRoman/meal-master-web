namespace MealMaster.Server.Models.Entities
{
    public class Game
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? ImgPath { get; set; }

        public List<Recipe> Recipes { get; set; } = [];
    }
}
