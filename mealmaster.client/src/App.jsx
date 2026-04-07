import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { UserProvider } from "./UserContext";

import Header from "./Header";

import HomePage from './pages/HomePage';
import SelectGamesPage from './pages/SelectGamesPage';
import SelectRecipesPage from './pages/SelectRecipesPage';
import LoginPage from './pages/LoginPage';
import UserPage from './pages/UserPage';
import RecipePage from './pages/RecipePage';
import CreateRecipePage from './pages/CreateRecipePage';
import RegistrationPage from './pages/RegistrationPage';
import AdminPage from './pages/admin/AdminPage';
import AdminIngredientsPage from './pages/admin/AdminIngredientsPage';
import AdminGamesPage from './pages/admin/AdminGamesPage';
import AdminUnitsPage from './pages/admin/AdminUnitsPage';

export default function App() {
    return (
        <UserProvider>
            <Router>
            <Header />
                <div className="p-2">
                    <Routes>
                        <Route path="/"                      element={<HomePage />} />
                        <Route path="/games"                 element={<SelectGamesPage />} />
                        <Route path="/recipes"               element={<SelectRecipesPage />} />
                        <Route path="/recipes/games/:gameId" element={<SelectRecipesPage />} />
                        <Route path="/recipe/:id"            element={<RecipePage />} />
                        <Route path="/recipe/create"         element={<CreateRecipePage />} />
                        <Route path="/recipe/:id/update"     element={<CreateRecipePage />} />
                        <Route path="/login"                 element={<LoginPage />} />
                        <Route path="/registration"          element={<RegistrationPage />} />
                        <Route path="/user/:id"              element={<UserPage />} />
                        <Route path="/user/me"               element={<UserPage />} />

                        <Route path="/admin" element={<AdminPage />}/>
                        <Route path="/admin/games" element={<AdminGamesPage />} />
                        <Route path="/admin/ingredients" element={<AdminIngredientsPage />} />
                        <Route path="/admin/units" element={<AdminUnitsPage />} />

                        <Route path="*" element={<h1>404</h1>} />
                    </Routes>
                </div>
            </Router>
        </UserProvider>
    );
}