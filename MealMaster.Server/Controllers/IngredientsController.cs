using MealMaster.Data;
using MealMaster.Server.Data;
using MealMaster.Server.Models.DTOs;
using MealMaster.Server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MealMaster.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IngredientsController(MyDbContext context)
        : ControllerBase
    {
        MyDbContext _context = context;

        private IQueryable<Ingredient> GetFull()
        {
            return _context.Ingredients
                .Include(i => i.Units);
        }

        private async Task<Ingredient?> GetFullByIdAsync(
            int id)
        {
            return await GetFull()
                .FirstOrDefaultAsync(
                    i => i.Id == id);
        }

        [HttpGet]
        public async Task<IActionResult> SelectAsync()
        {
            var ingredients = await GetFull().ToListAsync();
            return Ok(ingredients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> FindAsync(int id)
        {
            var ingredient = await GetFullByIdAsync(id);

            if (ingredient == null)
                return NotFound();

            return Ok(ingredient);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> InsertAsync(
            IngredientDto dto)
        {
            var ingredient = new Ingredient()
            {
                Name = dto.Name,
            };

            var units = await _context.Units
                .Where(u => dto.UnitIds.Contains(u.Id))
                .ToListAsync();

            ingredient.Units.AddRange(units);

            await _context.Ingredients.AddAsync(ingredient);
            await _context.SaveChangesAsync();

            var fullIngr = await GetFullByIdAsync(ingredient.Id);
            return Ok(fullIngr);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(
            int id, IngredientDto dto)
        {
            var ingredient = await GetFullByIdAsync(id);

            if (ingredient == null)
                return NotFound();

            ingredient.Name = dto.Name;

            var units = await _context.Units
                .Where(u => dto.UnitIds.Contains(u.Id))
                .ToListAsync();

            ingredient.Units.Clear();
            ingredient.Units.AddRange(units);

            await _context.SaveChangesAsync();

            var fullIngr = await GetFullByIdAsync(ingredient.Id);
            return Ok(fullIngr);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(
            int id)
        {
            var ingredient = await _context.Ingredients
                .FindAsync(id);

            if (ingredient == null)
                return NotFound();

            _context.Ingredients.Remove(ingredient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadImageAsync(
            int id, IFormFile image)
        {
            var ingredient = await _context.Ingredients
                .FindAsync(id);

            if (ingredient == null)
                return NotFound("Ingredient not found");

            if (image == null || image.Length == 0)
                return BadRequest("Image is invalid");

            ingredient.ImgPath = Tools.SaveImage(image);
            await _context.SaveChangesAsync();

            return Ok(ingredient.ImgPath);
        }
    }
}