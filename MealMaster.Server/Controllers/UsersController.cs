using MealMaster.Data;
using MealMaster.Server.Data;
using MealMaster.Server.Models.DTOs;
using MealMaster.Server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MealMaster.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(
        MyDbContext context, 
        UserManager<ProgramUser> userManager,
        JwtService jwtService)
    : ControllerBase
    {
        private readonly UserManager<ProgramUser> _userManager = userManager;
        readonly MyDbContext _context = context;
        private readonly JwtService _jwtService = jwtService;

        private IQueryable<UserInfo> GetFullInfos()
        {
            return _context.UserInfos
                .Include(u => u.Recipes)
                .Include(u => u.Ratings);
        }

        private async Task<UserInfo?> GetFullInfoByIdAsync(
            int id)
        {
            return await GetFullInfos()
                .FirstOrDefaultAsync(
                    ui => ui.Id == id);
        }

        [HttpGet]
        public async Task<IActionResult> SelectInfosAsync()
        {
            var userInfos = await GetFullInfos()
                .ToListAsync();

            return Ok(userInfos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> FindInfoAsync(
            int id)
        {
            var userInfo = await GetFullInfoByIdAsync(id);

            if (userInfo == null)
                return NotFound();

            return Ok(userInfo);
        }

        [HttpGet("me")]
        public async Task<IActionResult> FindCurrentInfoAsync()
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var userInfo = await GetFullInfos()
                .FirstOrDefaultAsync(
                    ui => ui.UserId == userId);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            return Ok(userInfo);
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(
            RegistrationDto dto)
        {
            if (await _userManager.FindByNameAsync(dto.Login) != null)
                return BadRequest("Username already exists");

            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                return BadRequest("Email already exists");

            var user = new ProgramUser
            {
                UserName = dto.Login,
                Email = dto.Email,
            };

            var result = await _userManager
                .CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors
                    .Select(e => e.Description);

                return BadRequest(errors.FirstOrDefault());
            }

            var userInfo = new UserInfo
            {
                UserId = user.Id,
                Name = dto.Name,
            };

            _context.UserInfos.Add(userInfo);
            await _context.SaveChangesAsync();

            var token = _jwtService.GenerateToken(user);
            var fullUser = await GetFullInfoByIdAsync(userInfo.Id);

            return Ok(new
            {
                Token = token.Result,
                Info = fullUser
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync(
            LoginDto dto)
        {
            var user = await _userManager
                .FindByNameAsync(dto.Login);

            if (user == null)
                return Unauthorized("Invalid username or password");

            var passwordValid = await _userManager
                .CheckPasswordAsync(user, dto.Password);

            if (!passwordValid)
                return Unauthorized("Invalid username or password");

            var token = _jwtService
                .GenerateToken(user);

            var fullUser = await _context.UserInfos
                .FirstOrDefaultAsync(ui => 
                    ui.UserId == user.Id);

            return Ok(new
            {
                Token = token.Result,
                Info = fullUser
            });
        }

        public async Task<IActionResult> UpdateInfoAsync(
            string userId, UserInfoDto dto)
        {
            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(ui => 
                    ui.UserId == userId);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            userInfo.Name = dto.Name;
            userInfo.Biography = dto.Biography;
            userInfo.Birthday = dto.Birthday;

            await _context.SaveChangesAsync();

            var fullUser = await GetFullInfoByIdAsync(userInfo.Id);
            return Ok(fullUser);
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateInfoViaUserAsync(
            UserInfoDto dto)
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            return await UpdateInfoAsync(userId, dto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInfoViaAdminAsync(
            int id, UserInfoDto dto)
        {
            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(ui =>
                    ui.Id == id);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            return await UpdateInfoAsync(userInfo.UserId, dto);
        }

        public async Task<IActionResult> DeleteAsync(
            string userId)
        {
            var user = await _userManager
                .FindByIdAsync(userId);

            if (user == null)
                return NotFound("User not found");

            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(
                    ui => ui.UserId == userId);

            if (userInfo != null)
            {
                _context.UserInfos.Remove(userInfo);
                await _context.SaveChangesAsync();
            }

            var result = await _userManager
                .DeleteAsync(user);

            if (!result.Succeeded)
            {
                var errors = result.Errors
                    .Select(e => e.Description);

                return BadRequest(errors);
            }

            return NoContent();
        }

        [Authorize]
        [HttpDelete("me")]
        public async Task<IActionResult> DeleteViaUserAsync()
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            return await DeleteAsync(userId);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteViaAdminAsync(
            int id)
        {
            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(ui =>
                    ui.Id == id);

            if (userInfo == null)
                return NotFound("UserInfo not found");

            return await DeleteAsync(userInfo.UserId);
        }

        [Authorize]
        [HttpPost("image")] 
        public async Task<IActionResult> UploadImage(
            IFormFile image) 
        {
            var userId = User.FindFirstValue("userId");

            if (userId == null)
                return Unauthorized();

            var userInfo = await _context.UserInfos
                .FirstOrDefaultAsync(ui => 
                    ui.UserId == userId);

            if (userInfo == null) 
                return NotFound(); 
            
            if (image == null || image.Length == 0)
            {
                userInfo.ImgPath = null;
                return NoContent();
            }
            
            userInfo.ImgPath = Tools.SaveImage(image);
            await _context.SaveChangesAsync();
            
            return Ok(userInfo.ImgPath); 
        }
    }
}
