using MealMaster.Server.Data;
using MealMaster.Server.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MealMaster.Data
{
    public class MyDbContext(DbContextOptions<MyDbContext> options) 
        : IdentityDbContext<ProgramUser>(options)
    {
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<Rating> Ratings { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<UserInfo> UserInfos { get; set; }

        public DbSet<RecipeIngredient> RecipesIngredients { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserInfo>()
                .HasOne(ui => ui.User)
                .WithOne(u => u.UserInfo)
                .HasForeignKey<UserInfo>(ui => ui.UserId);

            modelBuilder.Entity<RecipeIngredient>()
                .HasKey(ri => new { ri.RecipeId, ri.IngredientId });

            modelBuilder.Entity<RecipeIngredient>()
                .HasOne(ri => ri.Recipe)
                .WithMany(r => r.RecipesIngredients)
                .HasForeignKey(ri => ri.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RecipeIngredient>()
                .HasOne(ri => ri.Ingredient)
                .WithMany(i => i.RecipesIngredients)
                .HasForeignKey(ri => ri.IngredientId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Rating>()
                .HasKey(rat => new { rat.RecipeId, rat.UserInfoId });

            modelBuilder.Entity<Rating>()
                .HasOne(r => r.Recipe)
                .WithMany(rec => rec.Ratings)
                .HasForeignKey(r => r.RecipeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Rating>()
                .HasOne(r => r.UserInfo)
                .WithMany(u => u.Ratings)
                .HasForeignKey(r => r.UserInfoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Ingredient>()
                .HasMany(i => i.Units)
                .WithMany(u => u.Ingredients)
                .UsingEntity(etb => etb.ToTable("IngredientsUnits"));

            modelBuilder.Entity<Recipe>()
                .HasMany(r => r.Games)
                .WithMany(g => g.Recipes)
                .UsingEntity(etb => etb.ToTable("RecipesGames"));

            modelBuilder.Entity<UserInfo>()
                .Property(u => u.Birthday)
                .HasConversion(
                    d => d.HasValue
                        ? d.Value.ToDateTime(TimeOnly.MinValue)
                        : (DateTime?) null,
                    d => d.HasValue
                        ? DateOnly.FromDateTime(d.Value)
                        : null);

            modelBuilder.Entity<Recipe>()
                .Property(r => r.CreatedAt)
                .HasConversion(
                    d => d.ToDateTime(TimeOnly.MinValue),
                    d => DateOnly.FromDateTime(d));
        }
    }
}
