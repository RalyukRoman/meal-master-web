using MealMaster.Data;
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
    public class RatingsController(MyDbContext context) 
    : ControllerBase
    {
        readonly MyDbContext _context = context;

        private IQueryable<Rating> GetFull()
        {
            return _context.Ratings
                .Include(u => u.Recipe)
                .Include(u => u.UserInfo);
        }

        private async Task<Rating?> GetFullByIds(
            int userInfoId, int recipeId)
        {
            return await GetFull()
                .FirstOrDefaultAsync(r =>
                    r.UserInfoId == userInfoId &&
                    r.RecipeId == recipeId);
        }

        private async Task<Rating?> GetFullByUserId(
            int userInfoId)
        {
            return await GetFull()
                .FirstOrDefaultAsync(r =>
                    r.UserInfoId == userInfoId);
        }

        [HttpGet]
        public async Task<IActionResult> SelectAsync()
        {
            var users = await GetFull().ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{userId}")]
        public async Task<IActionResult> FindByUserIdAsync(
            int userId)
        {
            var user = await GetFullByUserId(userId);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> InsertAsync(
            RatingDto dto)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(ui => 
                    ui.UserId == userId);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            var rating = new Rating
            {
                UserInfoId = userInfo.Id,
                RecipeId = dto.RecipeId,
                Mark = dto.Mark
            };

            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

            var fullRating = await GetFullByIds(
                rating.UserInfoId, rating.RecipeId);

            return Ok(fullRating);
        }

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> UpdateAsync(
            RatingDto dto)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(ui => 
                    ui.UserId == userId);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            var rating = await _context.Ratings
                .FirstOrDefaultAsync(r =>
                    r.UserInfoId == userInfo.Id &&
                    r.RecipeId == dto.RecipeId);

            if (rating == null)
                return NotFound("Rating not found");

            rating.Mark = dto.Mark;

            await _context.SaveChangesAsync();

            var fullRating = await GetFullByIds(
                rating.UserInfoId, rating.RecipeId);

            await _context.SaveChangesAsync();

            var fullUser = await GetFullByIds(
                rating.UserInfoId, rating.RecipeId);

            return Ok(fullUser);
        }

        [Authorize]
        [HttpDelete("recipes/{recipeId}")]
        public async Task<IActionResult> DeleteAsync(
            int recipeId)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(ui =>
                    ui.UserId == userId);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            var rating = await _context.Ratings
                .FirstOrDefaultAsync(r =>
                    r.UserInfoId == userInfo.Id &&
                    r.RecipeId == recipeId);

            if (rating == null)
                return NotFound("Rating not found");

            _context.Ratings.Remove(rating);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
