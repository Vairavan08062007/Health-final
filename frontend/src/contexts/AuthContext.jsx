import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('vs_user')); }
        catch { return null; }
    });

    const login = useCallback(async (hospital_id, username, password) => {
        const res = await api.post('/auth/login', { hospital_id, username, password });
        const { access_token, role, full_name } = res.data;
        const userData = { hospital_id, username, role, full_name };
        localStorage.setItem('vs_token', access_token);
        localStorage.setItem('vs_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('vs_token');
        localStorage.removeItem('vs_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
