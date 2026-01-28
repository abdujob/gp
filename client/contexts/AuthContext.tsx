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
    role: 'EXPEDITEUR' | 'LIVREUR_GP' | 'ADMIN';
    avatar_url?: string;
    is_email_verified?: boolean;
    provider?: string;
}

/**
 * Interface pour les données d'inscription
 */
interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    role: 'EXPEDITEUR' | 'LIVREUR_GP' | 'ADMIN';
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
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
    isAuthenticated: boolean;
    isLivreurGP: boolean;
    isExpediteur: boolean;
    isAdmin: boolean;
    isEmailVerified: boolean;
    requestPasswordReset: (email: string) => Promise<any>;
    resetPassword: (token: string, password: string) => Promise<any>;
}

/**
 * Contexte d'authentification
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider du contexte d'authentification avec support des refresh tokens
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /**
     * Rafraîchir l'access token avec le refresh token
     */
    const refreshAccessToken = async (): Promise<boolean> => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                return false;
            }

            const res = await api.post('/auth/refresh', { refreshToken });
            const { accessToken } = res.data;

            // Mettre à jour l'access token
            localStorage.setItem('accessToken', accessToken);

            // Mettre à jour le header Authorization de l'API
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            return true;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            // Si le refresh échoue, déconnecter l'utilisateur
            await logout();
            return false;
        }
    };

    /**
     * Charger l'utilisateur depuis localStorage au montage
     */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                const userStr = localStorage.getItem('user');

                if (accessToken && userStr) {
                    const userData = JSON.parse(userStr);
                    setUser(userData);

                    // Configurer le header Authorization
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                    // Vérifier si le token est toujours valide
                    try {
                        const res = await api.get('/auth/me');
                        setUser(res.data);
                        localStorage.setItem('user', JSON.stringify(res.data));
                    } catch (error: any) {
                        // Si le token est expiré, essayer de le rafraîchir
                        if (error.response?.status === 401) {
                            const refreshed = await refreshAccessToken();
                            if (refreshed) {
                                // Réessayer de charger l'utilisateur
                                const res = await api.get('/auth/me');
                                setUser(res.data);
                                localStorage.setItem('user', JSON.stringify(res.data));
                            }
                        }
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error loading user:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();

        // Écouter les changements de localStorage (synchronisation entre onglets)
        window.addEventListener('storage', loadUser);
        window.addEventListener('userChanged', loadUser);

        return () => {
            window.removeEventListener('storage', loadUser);
            window.removeEventListener('userChanged', loadUser);
        };
    }, []);

    /**
     * Intercepteur pour gérer automatiquement le refresh token
     */
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Si l'erreur est 401 et qu'on n'a pas déjà essayé de rafraîchir
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refreshed = await refreshAccessToken();

                    if (refreshed) {
                        // Réessayer la requête originale avec le nouveau token
                        const accessToken = localStorage.getItem('accessToken');
                        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                        return api(originalRequest);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, []);

    /**
     * Fonction de connexion avec support des refresh tokens
     */
    const login = async (data: LoginData) => {
        try {
            const res = await api.post('/auth/login', data);
            const { accessToken, refreshToken, user: userData } = res.data;

            // Stocker les tokens et l'utilisateur
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Configurer le header Authorization
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

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

            // Gestion des erreurs spécifiques
            const errorData = error.response?.data;

            if (errorData?.code === 'ACCOUNT_LOCKED') {
                throw new Error(`Compte verrouillé. ${errorData.msg}`);
            } else if (errorData?.code === 'INVALID_CREDENTIALS') {
                const attemptsMsg = errorData.attemptsRemaining
                    ? ` (${errorData.attemptsRemaining} tentative(s) restante(s))`
                    : '';
                throw new Error(`Email ou mot de passe incorrect${attemptsMsg}`);
            } else {
                throw new Error(errorData?.msg || 'Erreur de connexion');
            }
        }
    };

    /**
     * Fonction d'inscription avec support des refresh tokens
     */
    const register = async (data: RegisterData) => {
        try {
            const res = await api.post('/auth/register', data);
            const { accessToken, refreshToken, user: userData } = res.data;

            // Stocker les tokens et l'utilisateur
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Configurer le header Authorization
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            setUser(userData);

            // Déclencher un événement pour notifier les autres composants
            window.dispatchEvent(new Event('userChanged'));

            // Redirection vers la page de vérification d'email
            router.push('/verify-email-notice');
        } catch (error: any) {
            console.error('Register error:', error);

            // Gestion des erreurs spécifiques
            const errorData = error.response?.data;

            if (errorData?.code === 'EMAIL_EXISTS') {
                throw new Error('Un compte avec cet email existe déjà');
            } else if (errorData?.errors && Array.isArray(errorData.errors)) {
                // Erreurs de validation
                const errorMessages = errorData.errors.map((err: any) => err.message).join(', ');
                throw new Error(errorMessages);
            } else {
                throw new Error(errorData?.msg || "Erreur d'inscription");
            }
        }
    };

    /**
     * Fonction de déconnexion
     */
    const logout = async () => {
        try {
            // Appeler l'API de déconnexion pour invalider le refresh token
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Nettoyer le localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            // Supprimer le header Authorization
            delete api.defaults.headers.common['Authorization'];

            setUser(null);

            // Déclencher un événement pour notifier les autres composants
            window.dispatchEvent(new Event('userChanged'));

            router.push('/');
        }
    };

    /**
     * Demander la réinitialisation du mot de passe (envoi d'email)
     */
    const requestPasswordReset = async (email: string) => {
        try {
            const res = await api.post('/auth/forgot-password', { email });
            return res.data; // { success: true } ou message d'erreur géré par le serveur
        } catch (error: any) {
            console.error('Forgot password error:', error);
            const errData = error.response?.data;
            throw new Error(errData?.msg || 'Erreur lors de la demande de réinitialisation');
        }
    };

    /**
     * Réinitialiser le mot de passe avec le token reçu par email
     */
    const resetPassword = async (token: string, password: string) => {
        try {
            const res = await api.post('/auth/reset-password', { token, password });
            return res.data; // { success: true }
        } catch (error: any) {
            console.error('Reset password error:', error);
            const errData = error.response?.data;
            throw new Error(errData?.msg || 'Erreur lors de la réinitialisation du mot de passe');
        }
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
        refreshAccessToken,
        requestPasswordReset,
        resetPassword,
        isAuthenticated: !!user,
        isLivreurGP: user?.role === 'LIVREUR_GP',
        isExpediteur: user?.role === 'EXPEDITEUR',
        isAdmin: user?.role === 'ADMIN',
        isEmailVerified: user?.is_email_verified ?? false,
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
