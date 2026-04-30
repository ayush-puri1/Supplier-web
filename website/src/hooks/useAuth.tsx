
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api';

interface User {
    id: string;
    email: string;
    role: 'SUPPLIER' | 'ADMIN' | 'SUPER_ADMIN';
    companyName?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser && storedUser !== 'undefined') {
            setToken(storedToken);
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // If company name is missing and user is a supplier, try to fetch it
                if (parsedUser.role === 'SUPPLIER' && !parsedUser.companyName) {
                    fetchWithAuth('/supplier/me')
                        .then(data => {
                            if (data.companyName) {
                                const updatedUser = { ...parsedUser, companyName: data.companyName };
                                setUser(updatedUser);
                                localStorage.setItem('user', JSON.stringify(updatedUser));
                            }
                        })
                        .catch(err => console.error("Failed to auto-fetch supplier profile", err));
                }
            } catch (e) {
                console.error("Failed to parse user from local storage", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        // Redirect based on role
        if (newUser.role === 'SUPPLIER') {
            router.push('/dashboard/supplier');
        } else {
            router.push('/dashboard/admin');
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await fetchWithAuth('/auth/logout', { method: 'POST' });
            }
        } catch (err) {
            console.error('Logout API failed, forcing local logout:', err);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
