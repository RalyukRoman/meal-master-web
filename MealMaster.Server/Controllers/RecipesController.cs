using MealMaster.Data;
using MealMaster.Server.Data;
using MealMaster.Server.Models.DTOs;
using MealMaster.Server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MealMaster.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController (MyDbContext context) 
        : ControllerBase
    {
        MyDbContext _context = context;

        private bool CanEditRecipe(
            Recipe recipe, string userId)
        {
            return recipe.UserInfo?.UserId == userId ||
                   User.IsInRole("Admin");
        }

        private IQueryable<Recipe> GetFull()
        {
            return _context.Recipes
                .Include(r => r.UserInfo)
                .Include(r => r.Games)
                .Include(r => r.Comments)
                .Include(r => r.Ratings)
                .Include(r => r.RecipesIngredients)
                    .ThenInclude(ri => ri.Ingredient)
                        .ThenInclude(i => i.Units);
        }

        private async Task<Recipe?> GetFullByIdAsync(int id)
        {
            return await GetFull()
                .FirstOrDefaultAsync(
                    r => r.Id == id);
        }

        [HttpGet]
        public async Task<IActionResult> SelectAsync()
        {
            var recipes = await _context.Recipes
                .Include(r => r.UserInfo)
                .Include(r => r.Games)
                .Include(r => r.Ratings)
                .ToListAsync();

            return Ok(recipes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> FindAsync(
            int id)
        {
            var recipe = await GetFullByIdAsync(id);

            if (recipe == null) 
                return NotFound("Recipe not found");

            return Ok(recipe);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> InsertAsync(
            RecipeDto dto)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(
                    ui => ui.UserId == userId);

            if (userInfo == null)
                return BadRequest("UserInfo not found");

            var recipe = new Recipe()
            {
                Name = dto.Name,
                Description = dto.Description,
                Instructions = dto.Instructions,
                CreatedAt = dto.CreatedAt,
                UserInfo = userInfo,
                Games = []
            };

            var games = await _context.Games
                .Where(g => dto.GameIds.Contains(g.Id))
                .ToListAsync();

            recipe.Games.AddRange(games);

            await _context.Recipes.AddAsync(recipe);
            await _context.SaveChangesAsync();

            var ingredients = await _context.Ingredients
                .Where(i => dto.RecipesIngredients
                    .Select(ri => ri.IngredientId)
                    .Contains(i.Id))
                .ToListAsync();

            var units = await _context.Units
                .Where(u => dto.RecipesIngredients
                    .Select(ri => ri.UnitId)
                    .Contains(u.Id))
                .ToListAsync();

            foreach (var recIngrDto in dto.RecipesIngredients)
            {
                var ingredient = ingredients
                    .FirstOrDefault(i => i.Id == recIngrDto.IngredientId);

                if (ingredient == null)
                    return BadRequest(
                        $"Ingredient {recIngrDto.IngredientId} not found");

                var unit = units
                    .FirstOrDefault(u => u.Id == recIngrDto.UnitId);

                if (unit == null)
                    return BadRequest(
                        $"Unit {recIngrDto.UnitId} not found");

                var recipeIngr = new RecipeIngredient()
                {
                    Ingredient = ingredient,
                    IngredientId = recIngrDto.IngredientId,
                    Recipe = recipe,
                    RecipeId = recipe.Id,
                    Quantity = recIngrDto.Quantity,
                    Unit = unit,
                    UnitId = recIngrDto.UnitId
                };

                await _context.RecipesIngredients
                    .AddAsync(recipeIngr);
            }

            await _context.SaveChangesAsync();

            var fullRecipe = await GetFullByIdAsync(recipe.Id);
            return Ok(fullRecipe);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(
            int id, RecipeDto dto)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var recipe = await _context.Recipes
                .Include(r => r.RecipesIngredients)
                .Include(r => r.Games)
                .Include(r => r.UserInfo)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null)
                return NotFound("Recipe not found");

            if (!CanEditRecipe(recipe, userId))
                return Forbid();

            recipe.Name = dto.Name;
            recipe.Description = dto.Description;
            recipe.Instructions = dto.Instructions;
            recipe.CreatedAt = dto.CreatedAt;

            var games = await _context.Games
                .Where(g => dto.GameIds.Contains(g.Id))
                .ToListAsync();

            var currentGames = recipe.Games.ToList();

            foreach (var game in currentGames)
            {
                if (!dto.GameIds.Contains(game.Id))
                    recipe.Games.Remove(game);
            }

            foreach (var game in games)
            {
                if (!recipe.Games.Any(g => g.Id == game.Id))
                    recipe.Games.Add(game);
            }

            var recipeIngrDtos = dto.RecipesIngredients;

            recipe.RecipesIngredients
                .Where(ri => !recipeIngrDtos
                    .Any(u => u.IngredientId == ri.IngredientId))
                .ToList()
                .ForEach(ri => _context.RecipesIngredients
                    .Remove(ri));

            var ingredients = await _context.Ingredients
                .Where(i => dto.RecipesIngredients
                    .Select(ri => ri.IngredientId)
                    .Contains(i.Id))
                .ToListAsync();

            var units = await _context.Units
                .Where(u => dto.RecipesIngredients
                    .Select(ri => ri.UnitId)
                    .Contains(u.Id))
                .ToListAsync();

            foreach (var recIngrDto in recipeIngrDtos)
            {
                var recIngr = recipe.RecipesIngredients
                    .FirstOrDefault(ri => 
                        ri.IngredientId == recIngrDto.IngredientId);

                if (recIngr != null)
                {
                    recIngr.Quantity = recIngrDto.Quantity;
                    recIngr.UnitId = recIngrDto.UnitId;
                }
                else
                {
                    var ingredient = ingredients
                        .FirstOrDefault(i => i.Id == recIngrDto.IngredientId);

                    if (ingredient == null)
                        return BadRequest(
                            $"Ingredient {recIngrDto.IngredientId} not found");

                    var unit = units
                        .FirstOrDefault(u => u.Id == recIngrDto.UnitId);

                    if (unit == null)
                        return BadRequest(
                            $"Unit {recIngrDto.UnitId} not found");

                    recIngr = new RecipeIngredient()
                    {
                        IngredientId = recIngrDto.IngredientId,
                        RecipeId = recipe.Id,
                        Quantity = recIngrDto.Quantity,
                        UnitId = recIngrDto.UnitId
                    };

                    await _context.RecipesIngredients
                        .AddAsync(recIngr);
                }
            }

            await _context.SaveChangesAsync();

            var fullRecipe = await GetFullByIdAsync(id);
            return Ok(fullRecipe);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(
            int id)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var recipe = await _context.Recipes
                .Include(u => u.UserInfo)
                .FirstOrDefaultAsync(
                    r => r.Id == id);

            if (recipe == null)
                return NotFound("Recipe not found");

            if (!CanEditRecipe(recipe, userId))
                return Forbid();

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadImageAsync(
            int id, IFormFile image)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var recipe = await _context.Recipes
                .Include(r => r.UserInfo)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recipe == null)
                return NotFound("Recipe not found");

            if (!CanEditRecipe(recipe, userId))
                return Forbid();

            if (image == null || image.Length == 0)
                recipe.ImgPath = null;

            recipe.ImgPath = Tools.SaveImage(image!);
            await _context.SaveChangesAsync();

            return Ok(recipe.ImgPath);
        }
    }
}
