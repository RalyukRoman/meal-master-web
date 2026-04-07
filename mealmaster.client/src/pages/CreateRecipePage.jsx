import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "../useUser";
import ModalImage from '../ModalImage';

export default function CreateRecipePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');

    const { id } = useParams();
    const { userInfo } = useUser();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [ingredients, setIngredients] = useState([]);
    const [games, setGames] = useState([]);

    const [modalImageOpened, setModalImageOpened] = useState(false);

    const [imageChanged, setImageChanged] = useState(false);
    const [oldImagePath, setOldImagePath] = useState(null);
    const [image, setImage] = useState(null);

    const [form, setForm] = useState({
        name: '',
        userId: userInfo?.id,
        description: '',
        instructions: '',
        createdAt: new Date().toISOString().split('T')[0],
        recipesIngredients: [],
        gameIds: []
    });

    const [ingredientDraft, setIngredientDraft] = useState({
        ingredient: null,
        unit: null,
        quantity: null
    });

    useEffect(() => {
        if (!token || !userInfo) {
            navigate(`/`);
        }
    }, [token, userInfo, navigate]);

    useEffect(() => {
        const loadRecipe = async (recipeId) => {
            try {
                const res = await fetch(
                    `https://localhost:7092/api/recipes/${recipeId}`
                );

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }

                const data = await res.json();

                if (userInfo.id != data.userInfoId) {
                    navigate(`/recipe/${recipeId}`);
                }

                setForm({
                    name: data.name,
                    userId: data.userInfo.id,
                    description: data.description,
                    instructions: data.instructions,
                    createdAt: data.createdAt,
                    recipesIngredients: data.recipesIngredients
                        .map(ri => ({
                            ingredientId: ri.ingredient.id,
                            unitId: ri.unit.id,
                            quantity: ri.quantity
                        })),
                    gameIds: data.games.map(g => g.id)
                });

                if (data.imgPath) {
                    setOldImagePath(
                        `https://localhost:7092/${data.imgPath}`
                    );
                }
            }
            catch (err) {
                setError(err.message);
            }
        };

        if (id) {
            loadRecipe(id);
        } 
    }, [id, userInfo, navigate])

    useEffect(() => {
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
            finally {
                setLoading(false);
            }
        };

        loadIngredients();
        loadGames();
    }, []);

    const uploadImage = async (image, id) => {
        const formData = new FormData();
        formData.append("image", image);

        const res = await fetch(`https://localhost:7092/api/recipes/${id}/image`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`https://localhost:7092/api/recipes${id ? `/${id}` : ''}`, {
                method: ( id ? 'PUT': 'POST' ),
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            const recipe = await res.json();

            if (imageChanged) {
                await uploadImage(image, recipe.id);
            }

            navigate(`/recipe/${recipe.id}`);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const chooseIngredient = (e) => {
        const ingr = ingredients.find(
            i => i.id === Number(e.target.value)
        );

        setIngredientDraft(() => ({
            ingredient: ingr || null,
            unit: null,
            quantity: null
        }));
    }

    const chooseUnit = (e) => {
        const unit = ingredientDraft.ingredient.units.find(
            i => i.id === Number(e.target.value)
        );

        setIngredientDraft((prev) => ({
            ...prev,
            unit: unit || null
        }));
    };

    const chooseQuantity = (e) => {
        if (e.target.value <= 0)
            return;

        setIngredientDraft((prev) => ({
            ...prev,
            quantity: e.target.value
        }));
    };

    const addIngredient = () => {
        if (!ingredientDraft.ingredient ||
            !ingredientDraft.unit ||
            !ingredientDraft.quantity)
          return;

        if (form.recipesIngredients.some(
                ri => ri.ingredientId === ingredientDraft.ingredient.id))
          return;

        setForm(prev => ({
            ...prev,
            recipesIngredients: [
                ...prev.recipesIngredients,
                {
                    ingredientId: ingredientDraft.ingredient.id,
                    unitId: ingredientDraft.unit.id,
                    quantity: ingredientDraft.quantity
                }
            ]
        }));
        
        setIngredientDraft({});
    }

    const deleteIngredient = (ingrId) => {
        setForm(prev => ({
            ...prev,
            recipesIngredients: prev.recipesIngredients
                .filter(ri => ri.ingredientId !== ingrId)
        }));
    }

    const addGame = (e) => {
        const game = games.find(
            g => g.id === Number(e.target.value)
        );

        if (!game) {
            return;
        }

        if (form.gamesIds &&
            form.gamesIds.includes(game.id)) {
            return;
        }

        setForm(prev => ({
            ...prev,
            gameIds: [
                ...prev.gameIds,
                game.id
            ]
        }));
    }

    const deleteGame = (id) => {
        setForm(prev => ({
            ...prev,
            gameIds: prev.gameIds
                .filter(gId => gId !== id)
        }));
    }

    if (loading) {
        return (
            <h3 className="text-center my-4">
                Loading...
            </h3>
        );
    }

    return (
        <div>
            <h2 className="my-3 mb-4 text-center">
                {id ? 'Update Recipe' : 'Create Recipe' }
            </h2>

            {error &&
                <p className="text-danger">
                    {error}
                </p>
            }

            <form onSubmit={handleSubmit}
                  className="d-flex flex-column gap-3 m-3 border border-2 
                             p-3 rounded border-black shadow">
                <div className="d-flex flex-row gap-4">
                    <div role="button"
                         style={{ width: "200px", height: "125px" }}
                         onClick={() => setModalImageOpened(true)}>
                        {image
                            ? <img src={URL.createObjectURL(image)}
                                   alt="preview"
                                   className="img-thumbnail mt-2 h-100 object-fit-cover" />
                            : ((oldImagePath && !imageChanged)
                                ? <img src={oldImagePath}
                                       className="img-thumbnail mt-2 h-100 object-fit-cover" />
                                : <div className="border border-2 d-flex align-items-center 
                                                  justify-content-center fs-1 h-100">
                                      <i class="bi bi-plus-lg"></i>
                                  </div>
                              )
                        }
                    </div>

                    <div className="w-100">
                        <div className="d-flex flex-row align-items-center">
                            <i className="bi bi-fork-knife me-3 fs-2"></i>
                            <input name="name"
                                   className="form-control my-2"
                                   value={form.name}
                                   onChange={handleChange}
                                   placeholder="--Name--" />
                        </div>

                        <textarea name="description"
                                  className="form-control mt-1"
                                  value={form.description}
                                  onChange={handleChange}
                                  placeholder="--Description--" />
                    </div>
                </div>

                <textarea name="instructions"
                          className="form-control mb-2"
                          value={form.instructions}
                          onChange={handleChange}
                          placeholder="--Instructions--" />

                <div className="d-flex flex-row w-100 gap-4">
                    <div className="d-flex flex-column gap-3 w-50
                                    border border-1 p-3 rounded">
                        <div className="d-flex flex-column gap-2 mb-2 mt-1">
                            <select onChange={chooseIngredient}
                                    className="form-control">
                                <option key="0" value="">
                                    --Select ingredient--
                                </option>

                                {ingredients
                                    .filter(i =>
                                        !form.recipesIngredients.some(
                                            ri => ri.ingredientId == i.id)
                                    )
                                    .map(i => 
                                        <option key={i.id} value={i.id}>
                                            {i.name}
                                        </option>
                                    )
                                }
                            </select>

                            <div className="d-flex flex-row gap-2">
                                <input name="quantity"
                                        type="number"
                                        className="form-control"
                                        value={ingredientDraft.quantity || ''}
                                        onChange={chooseQuantity}
                                        placeholder="--Quantity--"
                                        disabled={!ingredientDraft.ingredient}/>

                                <select onChange={chooseUnit}
                                        className="form-control"
                                        disabled={!ingredientDraft.ingredient}>
                                    <option key="0" value="">
                                        --Select unit--
                                    </option>

                                    {ingredientDraft.ingredient?.units.map(u =>
                                        <option key={u.id} value={u.id}>
                                            {u.code}
                                        </option>
                                    )}
                                </select>
                            </div>

                            <button type="button" onClick={addIngredient}
                                    className={(!ingredientDraft.unit || !ingredientDraft.quantity)
                                               ? 'btn btn-secondary' : 'btn btn-outline-primary'}
                                    disabled={!ingredientDraft.unit || !ingredientDraft.quantity}>
                                Add
                            </button>
                        </div>

                        <div className="d-flex flex-row gap-2">
                            <p className="m-0 fw-semibold">
                                Ingredients:
                            </p>

                            <div className="d-flex flex-column align-items-start">
                                {form.recipesIngredients.length <= 0 &&
                                    <p className="m-0">
                                        None
                                    </p>
                                }

                                {form.recipesIngredients.map(ri => {
                                    const ingr = ingredients.find(i => i.id === ri.ingredientId);
                                    const unit = ingr?.units.find(u => u.id === ri.unitId);

                                    return <p className="m-0">
                                        {ingr.name} - {ri.quantity} {unit.code}

                                        <button className="btn text-danger m-0 ms-2 p-0 pb-1"
                                                onClick={() => deleteIngredient(ingr.id)}
                                                type="button">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </p>
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex flex-column gap-3 w-50
                                    border border-1 p-3 rounded">
                        <div className="d-flex flex-row gap-2 mt-1 
                                        align-items-center">
                            <select onChange={addGame}
                                    className="form-control">
                                <option key="0" value="">
                                    --Select games--
                                </option>

                                {games
                                    .filter(g =>
                                        !form.gameIds.includes(g.id)
                                    )
                                    .map(i =>
                                        <option key={i.id}
                                            value={i.id}>{i.name}
                                        </option>
                                    )
                                }
                            </select>
                        </div>

                        <div className="d-flex flex-row gap-2 mt-1">
                            <p className="m-0 fw-semibold">
                                Games:
                            </p>

                            <div className="d-flex flex-column align-items-start">
                                {form.gameIds.length <= 0 &&
                                    <p className="m-0">
                                        None
                                    </p>
                                }

                                {form.gameIds.map(gameId =>
                                    <p className="m-0">
                                        {games
                                            .find(g => g.id === gameId)
                                            .name
                                        }

                                        <button className="btn text-danger m-0 ms-2 p-0 pb-1"
                                                onClick={() => deleteGame(gameId)}
                                                type="button">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary mt-3 w-100"
                        type="submit">
                    Save
                </button>
            </form>

            {modalImageOpened && (
                <ModalImage
                    onClose={() => setModalImageOpened(false)}
                    onTake={(image) => {
                        setImage(image);
                        setImageChanged(true);
                    }}>
                </ModalImage>
            )}
        </div>
    );
}