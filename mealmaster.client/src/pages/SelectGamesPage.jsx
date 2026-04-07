import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import NonePicture from '../assets/none-picture.jfif';

export default function MainPage() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);

    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadGames = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7092/api/games`
                );

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }
                else
                    setGames(await res.json());
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        }

        loadGames();
    }, []);

    useEffect(() => {
        const filterGames = async () => {
            if (search.trim() === '') {
                setFilteredGames(games);
                return;
            }

            setFilteredGames(games
                .filter(g =>
                    g.name
                        .toLowerCase()
                        .includes(search.toLowerCase())
                )
            );
        }

        filterGames();
    }, [search, games]);

    if (loading)
        return <h3>Loading...</h3>;

    if (error)
        return <p className="text-danger">{error}</p>;

    if (games.length === 0)
        return <p>No games found</p>;

    return (
        <div>
            <div className="mb-3">
                <div className="d-flex flex-row gap-3 
                                align-items-center">
                    <input className="form-control"
                           onChange={(e) => setSearch(e.target.value) }
                           placeholder="Search" />
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
                {filteredGames.map(g => (
                    <Link to={`/recipes/games/${g.id}`} key={g.id}
                          className="card shadow no-style-link">
                        <div className="card-body d-flex flex-column w-100
                                        justify-content-between gap-2">
                            <p className="fw-semibold m-0 text-center">
                                {g.name}
                            </p>

                            <p className="m-0 text-center text-success">
                                Recipes: {g.recipes.length}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}