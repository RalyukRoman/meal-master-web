import { createRoot } from 'react-dom/client'
import { UserProvider } from "./UserContext";
import App from './App'

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <UserProvider>
        <App />
    </UserProvider>
);