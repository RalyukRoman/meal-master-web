# Meal Master
MealMaster is a web application for managing recipes and meal planning. Users can register, log in via JWT, view recipes, and create their own. The project combines a modern frontend based on React with a powerful backend based on ASP.Net Core.

## Launch 
### Backend (ASP.Net Core)
1. Open the project in Visual Studio or VS Code.
2. Install dependencies via NuGet (if not installed)
3. Configure the SQLite database in appsettings.json.
4. Run migrations:
``` dotnet ef database update ```
5. Start the server:
``` dotnet run ```
6. The backend will be available at https://localhost:5001.

### Frontend (React + Vite)
1. Install npm dependencies:
``` npm install ```
2. Run development server:
``` npm run dev ```
3. Open in browser: http://localhost:5173
  
## Utils
### Backend
- ASP.Net Core 10
- Entity Framework Core (SQLite)
- ASP.Net Identity + JWT Authentication
- OpenAPI / Swagger

### Frontend
- React 19
- React Router DOM 7
- Redux Toolkit
- jwt-decode
- Vite
- ESLint + plugins for React and hooks
