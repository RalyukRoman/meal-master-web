import Logo from './assets/logo.png';

import { Link } from 'react-router-dom';
import { useUser } from "./useUser";
import { jwtDecode } from "jwt-decode";

export default function Header() {
    const { userInfo } = useUser();

    const token = localStorage.getItem("jwtToken");
    let isAdmin = false;

    if (token) {
        const decoded = jwtDecode(token);
        isAdmin = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Admin";
    }

    return (
        <header className="d-flex flex-row justify-content-between p-2 
                           border-bottom border-2">
            <div className="d-flex flex-row gap-3">
                <Link to="/" className="no-style-link">
                    <div className="d-flex flex-row gap-1">
                        <img src={Logo}
                             style={{
                                width: "40px",
                                objectFit: "contain"
                             }} />

                        <h3>MealMaster</h3>
                    </div>
                </Link>

                <Link to="/recipes" className="no-style-link">
                    <div className="fw-semibold">
                        Recipes
                    </div>
                </Link>

                <Link to="/games" className="no-style-link">
                    <div className="fw-semibold">
                        Games
                    </div>
                </Link>

                {userInfo &&
                    <Link to="/recipe/create" className="no-style-link ms-1">
                        <div className="text-primary">
                            <i className="bi bi-file-earmark-plus me-2"></i>
                            Add Recipe
                        </div>
                    </Link>
                }

                {isAdmin &&
                    <Link to="/admin" className="no-style-link ms-1">
                        <div className="text-success">
                            <i className="bi bi-pc-display me-2"></i>
                            Admin Panel
                        </div>
                    </Link>
                }
            </div>

            <div>
                <Link to={userInfo ? `/user/me` : '/login'}
                      className="no-style-link">
                    <div className={`d-flex flex-row gap-2 btn
                                    ${userInfo ? 'fw-semibold text-black'
                                               : 'btn-primary'}`}>
                        {userInfo?.imgPath
                            ? <img src={`https://localhost:7092/${userInfo.imgPath}`}
                                   style={{ width: "23px", height: "23px" }}
                                   className="object-fit-cover rounded-circle" />
                            : <i className="bi bi-person"></i>
                        }

                        <p className="m-0">
                            {userInfo ? userInfo.name : 'Login'}
                        </p>
                    </div>
                </Link>
            </div>
        </header>
    );
}