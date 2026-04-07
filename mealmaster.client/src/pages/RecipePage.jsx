import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "../useUser";
import ModalConfirmation from '../ModalConfirmation';

export default function RecipePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');

    const { id } = useParams();
    const { userInfo, updateUserInfo } = useUser();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [modalDeleteOpened, setModalDeleteOpened] = useState(false);

    const [recipe, setRecipe] = useState({});
    const [commentText, setCommentText] = useState("");

    const isSameUser =
        userInfo &&
        recipe?.userInfo &&
        userInfo.id === recipe.userInfo.id;

    useEffect(() => {
        const loadRecipe = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7092/api/recipes/${id}`
                );

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }

                setRecipe(await res.json());
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        }

        loadRecipe();
    }, [id]);

    const handleDelete = async () => {
        try {
            if (!userInfo || !token || !recipe) {
                return;
            }

            const res = await fetch(`https://localhost:7092/api/recipes/${recipe.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            await updateUserInfo();
            navigate(`/`);
        }
        catch (err) {
            setError(err.message);
        }
    }

    const handleRating = async (mark) => {
        try {
            if (!userInfo || !token) {
                return;
            }

            const rating = userInfo?.ratings.find(
                r => r.recipeId === recipe.id
            )

            if (!rating) {
                const res = await fetch('https://localhost:7092/api/ratings', {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        recipeId: recipe.id,
                        mark: mark
                    })
                });

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }

                const data = await res.json();

                setRecipe({
                    ...recipe,
                    ratings: [...recipe.ratings, data]
                });
            }
            else if (rating.mark === mark) {
                const res = await fetch(`https://localhost:7092/api/ratings/recipes/${recipe.id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }

                setRecipe({
                    ...recipe,
                    ratings: recipe.ratings
                        .filter(r => r.recipeId !== recipe.id)
                });
            }
            else {
                const res = await fetch('https://localhost:7092/api/ratings', {
                    method: 'PUT',
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        recipeId: recipe.id,
                        mark: mark
                    })
                });

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }

                const updatedData = await res.json();

                setRecipe({
                    ...recipe,
                    ratings: recipe.ratings.map(r =>
                        r.recipeId === recipe.id ? updatedData : r
                    )
                });
            }

            await updateUserInfo();
        }
        catch (err) {
            setError(err.message);
        }
    }

    const sendComment = async () => {
        try {
            if (!userInfo || !token) {
                return;
            }

            if (!commentText || commentText == "") {
                return;
            }

            const res = await fetch('https://localhost:7092/api/comments', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipeId: recipe.id,
                    text: commentText
                })
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            const data = await res.json();

            setRecipe({
                ...recipe,
                comments: [...recipe.comments, data]
            });
        }
        catch (err) {
            setError(err.message);
        }
    }

    const deleteComment = async (comment) => {
        try {
            if (!userInfo || !token || !comment) {
                return;
            }

            if (comment.userInfo.id != userInfo.id) {
                return;
            }

            const res = await fetch(`https://localhost:7092/api/comments/${comment.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            setRecipe({
                ...recipe,
                comments: recipe.comments
                    .filter(c => c.id != comment.id)
            });
        }
        catch (err) {
            setError(err.message);
        }
    }

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

    if (!recipe) {
        return (
            <h3 className="text-center my-4">
                No recipe found
            </h3>
        );
    }

    return (
        <div className="d-flex flex-column gap-3 m-3 border border-2 
                        p-3 rounded border-black shadow">

            <div className="d-flex flex-row justify-content-between
                            align-items-start">
                <div className="d-flex flex-column gap-3">
                    <div className="d-flex flex-row gap-4">
                        <div className="w-100">
                            <h2 className="mb-3">
                                <i className="bi bi-fork-knife me-3 fs-2"></i>
                                {recipe.name}
                            </h2>

                            <p className="d-flex flex-row m-0 w-100 gap-3">
                                <Link to={`/user/${recipe.userInfo.id}`}
                                      className="no-style-link">
                                    {recipe.userInfo?.imgPath
                                        ? <img src={`https://localhost:7092/${recipe.userInfo.imgPath}`}
                                               style={{ width: "20px", height: "20px" }}
                                               className="object-fit-cover rounded-circle me-2" />
                                        : <i className="bi bi-person"></i>
                                    }
                                    {recipe.userInfo.name}
                                </Link>

                                <span>
                                    •
                                </span>

                                <p className="m-0">
                                    <i className="bi bi-calendar-week me-2"></i>
                                    {recipe.createdAt}
                                </p>
                            </p>
                        </div>
                    </div>

                    <div className="d-flex flex-row gap-2">
                        {(userInfo && token)
                           ? <div>
                                {[...Array(5)].map((_, i) => {
                                    const rating = userInfo?.ratings.find(
                                        r => r.recipeId === recipe.id
                                    )

                                    return (
                                        <i key={i}
                                            className={rating && (rating.mark >= (i + 1))
                                                ? 'bi bi-star-fill'
                                                : 'bi bi-star'}
                                            role="button"
                                            onClick={() => handleRating(i + 1)}>
                                        </i>
                                    )
                                })}
                             </div>
                           : <div>
                                Rating:
                                <i className="bi bi-star ms-2"></i>
                             </div>
                        }
                        <span>
                            ({recipe.ratings.length > 0
                                ? (
                                    recipe.ratings.reduce((s, r) => s + r.mark, 0) /
                                    recipe.ratings.length
                                ).toFixed(1)
                                : 0
                            })
                        </span>
                    </div>
                </div>

                {isSameUser &&
                    <div className="d-flex flex-row gap-2">
                        <Link to={`/recipe/${recipe.id}/update`}
                            className="btn btn-outline-info">
                            <i className="bi bi-gear fs-6"></i>
                        </Link>

                        <button className="btn btn-outline-danger"
                            onClick={() => setModalDeleteOpened(true)}>
                            <i className="bi bi-trash fs-6"></i>
                        </button>
                    </div>
                }
            </div>

            {recipe.imgPath && (
                <img src={`https://localhost:7092/${recipe.imgPath}`}
                    style={{ width: "225px", height: "125px" }}
                    className="img-thumbnail object-fit-cover my-2" />
            )}

            <p className="mb-1">
                {recipe.description}
            </p>

            {recipe.games.length !== 0 && (
                <div className="mb-2">
                    <p className="fw-semibold mb-1">
                        Games:
                    </p>

                    {recipe.games.map(g =>
                        <div className="badge bg-secondary me-1">
                            {g.name}
                        </div>
                    )}
                </div>
            )}

            <div className="d-flex flex-row gap-3">
                <div className="border border-1 p-3 rounded"
                     style={{ minWidth: "200px" }}>
                    <p className="fw-semibold">
                        Ingredients:
                    </p>

                    {recipe.recipesIngredients.length === 0
                        ? 'None'
                        : (
                            <ol>
                                {recipe.recipesIngredients.map(ri =>
                                    <li>
                                        {ri.ingredient.name} - {ri.quantity} {ri.unit.code}
                                    </li>
                                )}
                            </ol>
                        )
                    }
                </div>

                <p className="pt-3 flex-grow-1 d-flex 
                              flex-column align-items-center">
                    <p className="fw-semibold">
                        Instructions
                    </p>

                    <p>
                        {recipe.instructions}
                    </p>
                </p>
            </div>

            <div className="d-flex flex-row w-100">
                <input type="text"
                       className="form-control rounded-0 rounded-start"
                       placeholder={(userInfo && token)
                           ? "Your comment..."
                           : 'You must be logged in to post a comment!'
                       }
                       value={commentText}
                       disabled={!(userInfo && token)}
                       onChange={(e) => setCommentText(e.target.value)}/>

                <button className="btn btn-outline-secondary
                                   rounded-0 rounded-end"
                        type="button"
                        onClick={sendComment}
                        disabled={!(userInfo && token)}>
                    <i class="bi bi-send"></i>
                </button>
            </div>

            <div>
                {recipe.comments.map(c => (
                    <div>
                        <hr className="mb-3 mt-0" />
                        <div className="d-flex flex-row justify-content-between 
                                        align-items-center mb-3">
                            <div className="d-flex flex-row gap-4 align-items-center">
                                <Link to={`/user/${c.userInfo.id}`}
                                      className="no-style-link">
                                    {c.userInfo?.imgPath
                                        ? <img src={`https://localhost:7092/${c.userInfo.imgPath}`}
                                               style={{ width: "20px", height: "20px" }}
                                               className="object-fit-cover rounded-circle me-2" />
                                        : <i className="bi bi-person"></i>
                                    }
                                    {c.userInfo.name}
                                </Link>

                                <span>
                                    -
                                </span>

                                <p className="m-0">
                                    {c.text}
                                </p>
                            </div>

                            <button className="btn text-danger py-0"
                                    onClick={() => deleteComment(c)}>
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {modalDeleteOpened && (
                <ModalConfirmation
                    onYes={handleDelete}
                    onNo={() => setModalDeleteOpened(false)}>
                    Do you want to delete?
                </ModalConfirmation>
            )}
        </div>
    );
}