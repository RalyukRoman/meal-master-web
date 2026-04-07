import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from "../useUser";
import { Link, useNavigate } from 'react-router-dom';
import NonePicture from '../assets/none-picture.jfif';
import ModalImage from '../ModalImage';
import ModalConfirmation from '../ModalConfirmation';

export default function UserPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');

    const { id } = useParams();
    const { userInfo, updateUserInfo } = useUser();

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isInfoChanged, setIsInfoChanged] = useState(false);

    const [modalImageOpened, setModalImageOpened] = useState(false);
    const [modalExitOpened, setModalExitOpened] = useState(false);

    const [imageChanged, setImageChanged] = useState(false);
    const [image, setImage] = useState(null);

    const [currentUser, setCurrentUser] = useState({});

    const [form, setForm] = useState({
        name: '',
        biography: '',
        birthday: ''
    });

    const isSameUser =
        (id && userInfo?.id === id) ||
        (!id && userInfo);

    useEffect(() => {
        const loadUser = async () => {
            try {
                if (isSameUser) {
                    setCurrentUser(userInfo);
                    return;
                }

                const res = await fetch(
                    `https://localhost:7092/api/users/${id}`
                );

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(error);
                }
                else {
                    const data = await res.json();
                    setCurrentUser(data);
                }
            }
            catch (err) {
                setError(err.message);
            }
            finally {
                setLoading(false);
            }
        }

        if (!id && !userInfo) {
            navigate(`/`);
            return;
        }

        loadUser();
    }, [id, userInfo, navigate, isSameUser]);

    useEffect(() => {
        setForm({
            name: currentUser.name,
            biography: currentUser.biography,
            birthday: currentUser.birthday
        });
    }, [currentUser]);

    const uploadImage = async (image) => {
        const formData = new FormData();
        formData.append("image", image);

        const res = await fetch('https://localhost:7092/api/users/image', {
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

        return await res.text();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!isSameUser) {
                return;
            }

            const res = await fetch('https://localhost:7092/api/users/me', {
                method: 'PUT',
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

            const updUserInfo = await res.json();

            if (imageChanged) {
                const imagePath = await uploadImage(image);
                updUserInfo.imgPath = imagePath;
                setImageChanged(false);
            }

            await updateUserInfo();
            setCurrentUser(updUserInfo);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsInfoChanged(false);
        }
    };

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));

        setIsInfoChanged(true);
    };

    const handleLogout = async () => {
        localStorage.removeItem("jwtToken");
        await updateUserInfo();

        navigate("/");
    };

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

    if (!currentUser) {
        return (
            <h3 className="text-center my-4">
                No user found
            </h3>
        );
    }

    return (
        <div className="d-flex flex-column align-items-center w-100">
            <form onSubmit={handleSubmit}
                  className="d-flex flex-column gap-3 m-3 border border-2 
                             p-3 rounded border-black shadow w-50">
                <div className="d-flex flex-row gap-3 align-items-center">
                    <img src={image
                            ? URL.createObjectURL(image)
                            : currentUser.imgPath
                                ? `https://localhost:7092/${currentUser.imgPath}`
                                : NonePicture}
                         style={{ width: "40px", height: "40px" }}
                         className="object-fit-cover rounded-circle"
                         onClick={() => isSameUser && setModalImageOpened(true)}
                         role={isSameUser ? 'button' : ''  } />

                    {isSameUser
                        ? <input className="fw-semibold fs-5 m-0 form-control"
                                 name="name"
                                 type="text"
                                 onChange={handleChange}
                                 value={form.name || ""}
                                 placeholder="Name" />
                        : <p className="fw-semibold fs-5 m-0">
                              {currentUser.name}
                          </p>
                    }
                    {isSameUser &&
                        <button className="btn btn-outline-danger"
                                onClick={() => setModalExitOpened(true)}
                                type="button">
                            <i className="bi bi-door-open"></i>
                        </button>
                    }
                </div>

                {isSameUser
                    ? <textarea className="fs-6 m-0 form-control"
                             name="biography"
                             type="text"
                             onChange={handleChange}
                             value={form.biography || ""}
                             placeholder="Biography" />
                    : <p className="fs-6 m-0">
                        {currentUser.biography
                            ? currentUser.biography
                            : '--No biography--'}
                      </p>
                }

                <div className="d-flex flex-row gap-3 align-items-center">
                    <p className="fs-6 m-0 fw-semibold">
                        Birthday:
                    </p>

                    {isSameUser
                        ? <input className="fs-6 m-0 form-control"
                                 name="birthday"
                                 type="date"
                                 onChange={handleChange}
                                 value={form.birthday}/>
                        : <p className="fs-6 m-0">
                            {currentUser.birthday
                                ? currentUser.birthday
                                : '--No date specified--'}
                          </p>
                    }
                </div>

                {(isInfoChanged || imageChanged) &&
                    <button className="btn btn-primary mt-3 w-100"
                            type="submit">
                        Save
                    </button>
                }

                <div>
                    <p className="fw-semibold fs-6">
                        Recipes:
                    </p>

                    <div className="border border-1 border-black p-3 
                                    overflow-auto"
                         style={{ maxHeight: "200px" }}>
                        {currentUser.recipes?.map(r => {
                            const avgRating = (r.ratings?.length > 0)
                                ? r.ratings
                                    .reduce((sum, rat) => sum + rat.mark, 0)
                                    / r.ratings.length
                                : 0;

                            return (
                                <Link to={`/recipe/${r.id}`} key={r.id}
                                    className="border border-1 rounded
                                              py-2 px-3 no-style-link mb-1">
                                    <div className="d-flex flex-row w-100
                                                    justify-content-between">
                                        <p className="m-0">
                                            {r.name}
                                        </p>

                                        <p className="m-0">
                                            {avgRating.toFixed(1)}
                                            <i className="bi bi-star ms-1"></i>
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </form>

            {modalImageOpened && (
                <ModalImage
                    onClose={() => setModalImageOpened(false)}
                    onTake={(image) => {
                        setImage(image);
                        setImageChanged(true)
                    }}>
                </ModalImage>
            )}

            {modalExitOpened && (
                <ModalConfirmation
                    onYes={handleLogout}
                    onNo={() => setModalExitOpened(false)}>
                    Do you want to go out?
                </ModalConfirmation>
            )}
        </div>
    );
}