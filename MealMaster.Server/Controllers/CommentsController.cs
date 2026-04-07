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
    public class CommentsController(MyDbContext context)
        : ControllerBase
    {
        readonly MyDbContext _context = context;

        private bool CanEditComment(
            Comment comment, string userId)
        {
            return comment.UserInfo?.UserId == userId || 
                   User.IsInRole("Admin");
        }

        private IQueryable<Comment> GetFull()
        {
            return _context.Comments
                .Include(c => c.UserInfo);
        }

        private async Task<Comment?> GetFullByIdAsync(int id)
        {
            return await GetFull()
                .FirstOrDefaultAsync(
                    c => c.Id == id);
        }

        [HttpGet]
        public async Task<IActionResult> SelectAsync()
        {
            var comments = await GetFull().ToListAsync();
            return Ok(comments);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> FindAsync(
            int id)
        {
            var comment = await GetFullByIdAsync(id);

            if (comment == null)
                return NotFound();

            return Ok(comment);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> InsertAsync(
            CommentDto dto)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(
                    u => u.UserId == userId);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            var recipe = await _context.Recipes
                .FirstOrDefaultAsync(
                    r => r.Id == dto.RecipeId);

            if (recipe == null)
                return NotFound("Recipe not found");

            var comment = new Comment()
            {
                Text = dto.Text,
                RecipeId = dto.RecipeId,
                UserInfoId = userInfo.Id
            };

            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();

            var fullComment = await GetFullByIdAsync(comment.Id);
            return Ok(fullComment);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(
            int id, CommentDto dto)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var comment = await GetFullByIdAsync(id);

            if (comment == null)
                return NotFound("Comment not found");

            if (!CanEditComment(comment, userId))
                return Forbid();

            comment.Text = dto.Text;
            await _context.SaveChangesAsync();

            return Ok(comment);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(
            int id)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var comment = await GetFullByIdAsync(id);

            if (comment == null)
                return NotFound("Comment not found");

            if (!CanEditComment(comment, userId))
                return Forbid();

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
