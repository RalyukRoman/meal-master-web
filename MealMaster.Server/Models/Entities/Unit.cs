namespace MealMaster.Server.Models.Entities
{
    public class Unit
    {
        public int Id { get; set; }
        public required string Code { get; set; }

        public List<Ingredient> Ingredients { get; set; } = [];
    }
}
