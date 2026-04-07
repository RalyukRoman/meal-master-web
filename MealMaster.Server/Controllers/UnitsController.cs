using MealMaster.Data;
using MealMaster.Server.Models.DTOs;
using MealMaster.Server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MealMaster.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitsController(MyDbContext context)
        : ControllerBase
    {
        readonly MyDbContext _context = context;

        [HttpGet]
        public IActionResult Select()
        {
            var units = _context.Units
                .ToList();

            return Ok(units);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> FindAsync(
            int id)
        {
            var unit = await _context.Units
                .FindAsync(id);

            if (unit == null)
                return NotFound("Unit not found");

            return Ok(unit);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> InsertAsync(
            UnitDto dto)
        {
            var unit = new Unit()
            {
                Code = dto.Code,
            };

            await _context.Units.AddAsync(unit);
            await _context.SaveChangesAsync();

            return Ok(unit);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(
            int id, UnitDto dto)
        {
            var unit = await _context.Units
                .FindAsync(id);

            if (unit == null)
                return NotFound("Unit not found");

            unit.Code = dto.Code;

            await _context.SaveChangesAsync();

            return Ok(unit);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(
            int id)
        {
            var unit = await _context.Units
                .FindAsync(id);

            if (unit == null)
                return NotFound("Unit not found");

            _context.Units.Remove(unit);
            await _context.SaveChangesAsync();
             
            return NoContent();
        }
    }
}
