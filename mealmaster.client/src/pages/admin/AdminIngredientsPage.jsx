import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminIngredientsPage() {
    const token = localStorage.getItem('jwtToken');

    const [error, setError] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [units, setUnits] = useState([]);

    const [selectedId, setSelectedId] = useState(null);

    const [form, setForm] = useState({
        name: '',
        unitIds: []
    });

    const loadIngredients = async () => {
        try {
            const res = await fetch(
                'https://localhost:7092/api/ingredients'
            );

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            setIngredients(await res.json());
        }
        catch (err) {
            setError(err.message);
        }
    };

    const loadUnits = async () => {
        try {
            const res = await fetch(
                'https://localhost:7092/api/units'
            );

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            setUnits(await res.json());
        }
        catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadIngredients();
        loadUnits();
    }, [ingredients]);

    useEffect(() => {
        const loadGameById = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7092/api/ingredients/${selectedId}`
                );

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }

                const data = await res.json();

                setForm(({
                    name: data.name,
                    unitIds: data.units.map(u => u.id)
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
                unitIds: []
            }));
        }
    }, [selectedId])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(
                `https://localhost:7092/api/ingredients${selectedId ? `/${selectedId}` : ''}`, {
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

            loadIngredients();
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

    const handleUnitToggle = (unitId) => {
        setForm(prev => ({
            ...prev,
            unitIds: prev.unitIds.includes(unitId)
                ? prev.unitIds.filter(id => id !== unitId)
                : [...prev.unitIds, unitId]
        }));
    };

    const handleDelete = async () => {
        if (!selectedId)
            return;

        try {
            const res = await fetch(
                `https://localhost:7092/api/ingredients/${selectedId}`, {
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

            loadIngredients();
            setSelectedId(null);
        }
        catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center mb-4">
            <h2 className="my-3">
                {selectedId ? "Edit Ingredient" : "Create Ingredient"}
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

                <div className="mb-2 w-100">
                    <p className="mb-2 fw-semibold">
                        Units:
                    </p>

                    <div className="d-flex flex-wrap">
                        {units.map(unit => (
                            <div key={unit.id} className="form-check me-3">
                                <input type="checkbox"
                                       className="form-check-input"
                                       checked={form.unitIds.includes(unit.id)}
                                       onChange={() => handleUnitToggle(unit.id)} />

                                <label className="form-check-label">
                                    {unit.code}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

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
                        List of ingredients
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
                    {ingredients.map(ing => (
                        <li className={`list-group-item ${selectedId === ing.id ? 'active' : ''}`}
                            role="button"
                            onClick={() => setSelectedId(ing.id)}>
                          {ing.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}