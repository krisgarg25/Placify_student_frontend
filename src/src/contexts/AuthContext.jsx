import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user', e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    async function login(email, password) {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async function signup(userData) {
        try {
            const response = await api.post('/api/auth/register', userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async function loginWithGoogle() {
        try {

            console.log("Google Login initiated (Placeholder)");

        } catch (error) {
            console.error("Google login failed", error);
            throw error;
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
    }

    const value = {
        currentUser,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
