using MealMaster.Server.Models.Entities;
using Microsoft.AspNetCore.Identity;

namespace MealMaster.Server.Data
{
    public class ProgramUser : IdentityUser
    {
        public virtual UserInfo? UserInfo { get; set; }
    }
}
