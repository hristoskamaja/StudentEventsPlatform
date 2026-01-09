import axios from "axios";
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080" });

let authToken = null;
export function setAuthToken(token) { authToken = token || null; }

client.interceptors.request.use((config) => {
    if (authToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

export default client;
export { client };
export const api = client;


