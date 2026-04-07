using System.ComponentModel.DataAnnotations.Schema;

namespace MealMaster.Server.Models.Entities
{
    public class Rating
    {
        public int Mark { get; set; }

        [ForeignKey(nameof(UserInfoId))]
        public UserInfo? UserInfo { get; set; }
        public int UserInfoId { get; set; }

        [ForeignKey(nameof(RecipeId))]
        public Recipe? Recipe { get; set; }
        public int RecipeId { get; set; }
    }
}
