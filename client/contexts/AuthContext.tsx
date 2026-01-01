'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

/**
 * Interface pour l'utilisateur connecté
 */
interface User {
    id: string;
    full_name: string;
    email: string;
    role: 'EXPEDITEUR' | 'LIVREUR_GP';
    phone?: string;
    address?: string;
    avatar_url?: string;
}

/**
 * Interface pour les données d'inscription
 */
interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    role: 'EXPEDITEUR' | 'LIVREUR_GP';
    phone?: string;
    address?: string;
}

/**
 * Interface pour les données de connexion
 */
interface LoginData {
    email: string;
    password: string;
}

/**
 * Interface du contexte d'authentification
 */
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLivreurGP: boolean;
    isExpediteur: boolean;
}

/**
 * Contexte d'authentification
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider du contexte d'authentification
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /**
     * Charger l'utilisateur depuis localStorage au montage
     */
    useEffect(() => {
        const loadUser = () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();

        // Écouter les changements de localStorage (pour la synchronisation entre onglets)
        window.addEventListener('storage', loadUser);

        // Écouter un événement personnalisé pour la mise à jour immédiate
        window.addEventListener('userChanged', loadUser);

        return () => {
            window.removeEventListener('storage', loadUser);
            window.removeEventListener('userChanged', loadUser);
        };
    }, []);

    /**
     * Fonction de connexion
     */
    const login = async (data: LoginData) => {
        try {
            const res = await api.post('/auth/login', data);
            const { token, user: userData } = res.data;

            // Stocker le token et l'utilisateur
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Déclencher un événement pour notifier les autres composants
            window.dispatchEvent(new Event('userChanged'));

            // Redirection selon le rôle
            if (userData.role === 'LIVREUR_GP') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.msg || 'Erreur de connexion');
        }
    };

    /**
     * Fonction d'inscription
     */
    const register = async (data: RegisterData) => {
        try {
            const res = await api.post('/auth/register', data);
            const { token, user: userData } = res.data;

            // Stocker le token et l'utilisateur
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            // Déclencher un événement pour notifier les autres composants
            window.dispatchEvent(new Event('userChanged'));

            // Redirection selon le rôle
            if (userData.role === 'LIVREUR_GP') {
                router.push('/dashboard');
            } else {
                router.push('/');
            }
        } catch (error: any) {
            console.error('Register error:', error);
            throw new Error(error.response?.data?.msg || "Erreur d'inscription");
        }
    };

    /**
     * Fonction de déconnexion
     */
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);

        // Déclencher un événement pour notifier les autres composants
        window.dispatchEvent(new Event('userChanged'));

        router.push('/');
    };

    /**
     * Valeurs du contexte
     */
    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLivreurGP: user?.role === 'LIVREUR_GP',
        isExpediteur: user?.role === 'EXPEDITEUR',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
