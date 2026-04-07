namespace MealMaster.Server.Data
{
    public static class Tools
    {
        public static string SaveImage(IFormFile image)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(image.FileName);

            string savePath = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot/images", fileName);

            using (var fs = new FileStream(savePath, FileMode.Create))
            {
                image.CopyTo(fs);
            }

            return "/images/" + fileName;
        }
    }
}
