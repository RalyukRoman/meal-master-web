import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../useUser";

export default function RegistrationPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');

    const { updateUserInfo } = useUser();

    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        login: '',
        password: '',
        name: '',
        email: '',
    });

    useEffect(() => {
        if (token) {
            navigate(`/`);
        }
    }, [token, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.login || !form.password) {
            setError("Login and password are required");
            return;
        }

        try {
            const res = await fetch(
                "https://localhost:7092/api/users/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            const data = await res.json();

            localStorage.setItem('jwtToken', data.token);
            await updateUserInfo();
            navigate(`/`);
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

    return (
        <div className="d-flex flex-column align-items-center">
            <h2 className="my-3">Registration</h2>

            {error &&
                <p className="text-danger">{error}</p>
            }

            <form onSubmit={handleSubmit}
                  className="d-flex flex-column align-items-center
                             p-3 border border-1 rounded w-50">
                <input name="login"
                       className="form-control my-2"
                       value={form.login}
                       onChange={handleChange}
                       placeholder="Login" />

                <input name="name"
                       className="form-control my-2"
                       value={form.name}
                       onChange={handleChange}
                       placeholder="Name" />

                <input name="email"
                       className="form-control my-2"
                       value={form.email}
                       onChange={handleChange}
                       placeholder="Email" />

                <input name="password"
                       className="form-control my-2"
                       value={form.password}
                       onChange={handleChange}
                       placeholder="Password" />
                    
                <button type="submit"
                        className="btn btn-primary w-100 mt-3">
                    Create
                </button>
            </form>
        </div>
    );
}