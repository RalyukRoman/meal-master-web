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
    public class GamesController(MyDbContext context)
        : ControllerBase
    {
        readonly MyDbContext _context = context;

        private IQueryable<Game> GetFull()
        {
            return _context.Games
                .Include(g => g.Recipes);
        }

        private async Task<Game?> GetFullByIdAsync(
            int id)
        {
            return await GetFull()
                .FirstOrDefaultAsync(
                    g => g.Id == id);
        }

        [HttpGet]
        public async Task<IActionResult> SelectAsync()
        {
            var games = await GetFull().ToListAsync();
            return Ok(games);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> FindAsync(
            int id)
        {
            var game = await GetFullByIdAsync(id);

            if (game == null)
                return NotFound("Game not found");

            return Ok(game);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> InsertAsync(
            Game game)
        {
            await _context.Games.AddAsync(game);
            await _context.SaveChangesAsync();

            var fullGame = await GetFullByIdAsync(game.Id);
            return Ok(fullGame);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(
            int id, GameDto dto)
        {
            var game = await GetFullByIdAsync(id);

            if (game == null)
                return NotFound("Game not found");

            game.Name = dto.Name;
            game.Description = dto.Description;

            await _context.SaveChangesAsync();

            return Ok(game);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(
            int id)
        {
            var games = await _context.Games
                .FindAsync(id);

            if (games == null)
                return NotFound("Game not found");

            _context.Games.Remove(games);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadImageAsync(
            int id, IFormFile image)
        {
            var game = await _context.Games
                .FindAsync(id);

            if (game == null)
                return NotFound("Game not found");

            if (image == null || image.Length == 0)
                return BadRequest("Image is invalid");

            game.ImgPath = Tools.SaveImage(image);
            await _context.SaveChangesAsync();

            return Ok(game.ImgPath);
        }
    }
}
