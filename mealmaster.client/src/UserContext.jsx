import { createContext, useState, useEffect } from "react";

const UserContext = createContext(null);
export default UserContext;

export const UserProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('jwtToken');

            if (!token) {
                setUserInfo(null);
                return;
            }

            const res = await fetch('https://localhost:7092/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('jwtToken');
                return;
            }

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            var data = await res.json();
            setUserInfo(data);
        }
        catch (err) {
            console.error(err);
            setUserInfo(null);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const updateUserInfo = async () => {
         await fetchUser();
    };

    return (
        <UserContext.Provider value={{ userInfo, updateUserInfo }}>
            {children}
        </UserContext.Provider>
    );
};