import axios from 'axios';

// Ensure standard fallback to Render live URL in case Vercel env overrides fail during Vite build
const API = import.meta.env.VITE_API_URL || 'https://health-final.onrender.com';

const api = axios.create({
    baseURL: API,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('vs_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// On 401, clear auth and redirect to login EXCEPT when actively logging in
api.interceptors.response.use(
    (res) => res,
    (err) => {
        // Only force strict redirect if user is not already on the login page
        // (Prevents destroying login feedback logs mapping to a full page reload)
        if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('vs_token');
            localStorage.removeItem('vs_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
