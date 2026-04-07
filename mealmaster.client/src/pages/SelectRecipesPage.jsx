import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import NonePicture from '../assets/none-picture.jfif';

export default function MainPage() {
    const { gameId } = useParams();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [recipes, setRecipes] = useState([]);
    const [game, setGame] = useState(null);
    const [filteredRecipes, setFilteredRecipes] = useState([]);

    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');

    useEffect(() => {
        const loadRecipes = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7092/api/recipes`
                );

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }
                else {
                    let recipes = await res.json();

                    if (gameId) {
                        recipes = recipes.filter(
                            r => r.games.some(
                                g => g.id == gameId
                            )
                        )
                    }

                    setRecipes(recipes);
                }
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        }

        const loadGame = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7092/api/games/${gameId}`
                );

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }
                else
                    setGame(await res.json());
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        }

        loadRecipes();
        if (gameId) loadGame();
    }, [gameId]);

    useEffect(() => {
        const filterRecipes = async () => {
            if (search.trim() === '') {
                setFilteredRecipes(recipes);
                return;
            }

            setFilteredRecipes(recipes
                .filter(r =>
                    r.name
                        .toLowerCase()
                        .includes(search.toLowerCase())
                )
            );
        }

        const sortRecipes = async () => {
            if (sort.trim() === '')
                return;

            setFilteredRecipes((prev) => prev.sort((a, b) => {
                switch (sort) {
                    case 'newest':
                        return new Date(a.createdAt) - new Date(b.createdAt);

                    case 'oldest':
                        return new Date(b.createdAt) - new Date(a.createdAt);

                    case 'name_asc':
                        return a.name.localeCompare(b.name);

                    case 'name_desc':
                        return b.name.localeCompare(a.name);

                    case 'rating_desc': {
                        const avgA = a.ratings?.length
                            ? a.ratings.reduce((sum, r) => sum + r.mark, 0)
                                / a.ratings.length
                            : 0;
                        const avgB = b.ratings?.length
                            ? b.ratings.reduce((sum, r) => sum + r.mark, 0)
                                / b.ratings.length
                            : 0;

                        return avgA - avgB;
                    }

                    case 'rating_asc': {
                        const avgA = a.ratings?.length
                            ? a.ratings.reduce((sum, r) => sum + r.mark, 0)
                                / a.ratings.length
                            : 0;
                        const avgB = b.ratings?.length
                            ? b.ratings.reduce((sum, r) => sum + r.mark, 0)
                                / b.ratings.length
                            : 0;

                        return avgB - avgA;
                    }

                    default:
                        return 0;
                }
            }));
        }

        filterRecipes();
        sortRecipes();
    }, [search, sort, recipes]);


    if (loading) {
        return (
            <h3 className="text-center my-4">
                Loading...
            </h3>
        );
    }

    if (error) {
        return (
            <p className="text-center my-4 text-danger">
                {error}
            </p>
        );
    }

    if (recipes.length === 0) {
        return (
            <h3 className="text-center my-4">
                No recipes found
            </h3>
        );
    }

    return (
        <div className="d-flex flex-row gap-2 align-items-start">
            <div className="card m-2 shadow w-25 p-3 gap-3"
                style={{ minWidth: "220px", maxWidth: "220px" }}>

                <div className="d-flex flex-row gap-3 align-items-center">
                    <input className="form-control"
                           onChange={(e) => setSearch(e.target.value)}
                           placeholder="Enter recipe name" />
                    <i className="bi bi-search"></i>
                </div>

                <div>
                    <div className="dropdown">
                        <button className="btn btn-outline-secondary dropdown-toggle"
                                type="button" data-bs-toggle="dropdown">
                            <span className="me-1">
                                Sort
                            </span>
                        </button>

                        <ul className="dropdown-menu">
                            <li>
                                <button className={`dropdown-item ${sort === 'newest' ? 'active' : ''}`}
                                        onClick={() => setSort('newest')}>
                                    <i className="bi bi-calendar2-week me-2"></i>
                                    Sort by newest
                                </button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${sort === 'oldest' ? 'active' : ''}`}
                                        onClick={() => setSort('oldest')}>
                                    <i className="bi bi-calendar2-week me-2"></i>
                                    Sort by oldest
                                </button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${sort === 'name_asc' ? 'active' : ''}`}
                                        onClick={() => setSort('name_asc')}>
                                    <i className="bi bi-sort-alpha-down-alt me-1"></i>
                                    Sort by name
                                </button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${sort === 'name_desc' ? 'active' : ''}`}
                                        onClick={() => setSort('name_desc')}>
                                    <i className="bi bi-sort-alpha-down me-1"></i>
                                    Sort by name
                                </button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${sort === 'rating_asc' ? 'active' : ''}`}
                                        onClick={() => setSort('rating_asc')}>
                                    <i className="bi bi-sort-numeric-down me-1"></i>
                                    Sort by rating
                                </button>
                            </li>
                            <li>
                                <button className={`dropdown-item ${sort === 'rating_desc' ? 'active' : ''}`}
                                        onClick={() => setSort('rating_desc')}>
                                    <i className="bi bi-sort-numeric-down-alt me-1"></i>
                                    Sort by rating
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="w-100">
                {game && (
                    <div className="border border-2 rounded py-2 px-3 m-2 mb-3">
                        <h2 className="text-center">
                            {game.name}
                        </h2>
                        <p className="text-center m-0">
                            {game.description}
                        </p>
                    </div>  
                )}  

                {filteredRecipes.map(r => {
                    const avgRating = (r.ratings?.length > 0)
                        ? r.ratings
                            .reduce((sum, rat) => sum + rat.mark, 0)
                        / r.ratings.length
                        : 0;

                    return (
                        <Link to={`/recipe/${r.id}`} key={r.id}
                              className="card m-2 shadow no-style-link 
                                         d-flex flex-row"
                              style={{ height: "90px" }}>

                            {r.imgPath && (
                                <img src={`https://localhost:7092/${r.imgPath}`}
                                    style={{ width: "80px" }}
                                    className="object-fit-cover image-fluid h-100 
                                               rounded-start" />
                            )}

                            <div className="card-body d-flex flex-row 
                                            justify-content-between">

                                <div className="d-flex flex-column gap-2">
                                    <p className="fw-semibold m-0">
                                        {r.name}
                                    </p>

                                    <p className="m-0">
                                        {avgRating.toFixed(1)}
                                        <i className="bi bi-star ms-1"></i>
                                    </p>
                                </div>

                                <div className="d-flex flex-column gap-2">
                                    <p className="m-0">
                                        <i className="bi bi-calendar-week me-2"></i>
                                        {r.createdAt}
                                    </p>

                                    <div className="d-flex flex-row gap-2 align-items-center">
                                        {r.userInfo?.imgPath
                                            ? <img src={`https://localhost:7092/${r.userInfo.imgPath}`}
                                                   style={{ width: "18px", height: "18px" }}
                                                   className="object-fit-cover rounded-circle" />
                                            : <i className="bi bi-person"></i>
                                        }

                                        <p className="m-0">
                                            {r.userInfo ? r.userInfo.name : 'Login'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}