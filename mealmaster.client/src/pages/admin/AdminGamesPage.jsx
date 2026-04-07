import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminGamesPage() {
    const token = localStorage.getItem('jwtToken');

    const [error, setError] = useState(null);
    const [games, setGames] = useState([]);

    const [selectedId, setSelectedId] = useState(null);

    const [form, setForm] = useState({
        name: '',
        description: ''
    });

    const loadGames = async () => {
        try {
            const res = await fetch(
                'https://localhost:7092/api/games'
            );

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            setGames(await res.json());
        }
        catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadGames();
    }, [games]);

    useEffect(() => {
        const loadGameById = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7092/api/games/${selectedId}`
                );

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }

                const data = await res.json();

                setForm(({
                    name: data.name,
                    description: data.description
                }));
            }
            catch (err) {
                setError(err.message);
            }
        };

        if (selectedId) {
            loadGameById();
        }
        else {
            setForm(({
                name: '',
                description: ''
            }));
        }
    }, [selectedId])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                `https://localhost:7092/api/games${selectedId ? `/${selectedId}` : ''}`, {
                    method: selectedId ? 'PUT' : 'POST',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(form)
                }
            );

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            loadGames();
            setSelectedId(null);

        }
        catch (err) {
            setError(err.message);
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleDelete = async () => {
        if (!selectedId)
            return;

        try {
            const res = await fetch(
                `https://localhost:7092/api/games/${selectedId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                }
            );

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            loadGames();
            setSelectedId(null);
        }
        catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center mb-4">
            <h2 className="my-3">
                {selectedId ? "Edit Game" : "Create Game"}
            </h2>

            {error &&
                <p className="text-danger">
                    {error}
                </p>
            }

            <form onSubmit={handleSubmit}
                  className="d-flex flex-column align-items-center
                             p-3 border border-1 rounded w-50">
                <input name="name"
                       className="form-control my-2"
                       value={form.name}
                       onChange={handleChange}
                       placeholder="Name" />

                <textarea name="description"
                          className="form-control my-2"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Description" />

                <div className="d-flex flex-row gap-2 mt-3 ">
                    <button className="btn btn-primary w-100"
                            type="submit">
                        {selectedId ? "Save" : "Send"}
                    </button>

                    {selectedId && (
                        <button className="btn btn-danger"
                                onClick={handleDelete}
                                type="button">
                            Delete
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-4 w-50">
                <div className="d-flex flex-row gap-3 mb-3
                                align-ietms-center">
                    <h4 className="m-0">
                        List of games
                    </h4>

                    {selectedId && (
                        <button className="btn text-secondary p-0 px-2"
                                onClick={() => setSelectedId(null)}
                                type="button">
                            <i class="bi bi-recycle fs-4"></i>
                        </button>
                    )}
                </div>

                <ul className="list-group">
                    {games.map(g => (
                        <li className={`list-group-item ${selectedId === g.id ? 'active' : ''}`}
                            role="button"
                            onClick={() => setSelectedId(g.id)}>
                          {g.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}