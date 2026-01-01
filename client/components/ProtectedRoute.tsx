'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * Props du composant ProtectedRoute
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'EXPEDITEUR' | 'LIVREUR_GP';
    redirectTo?: string;
}

/**
 * Composant HOC pour protéger les routes
 * Vérifie si l'utilisateur est connecté et a le rôle requis
 */
export default function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Attendre que le chargement soit terminé
        if (loading) return;

        // Rediriger si non connecté
        if (!user) {
            router.push(redirectTo);
            return;
        }

        // Rediriger si le rôle ne correspond pas
        if (requiredRole && user.role !== requiredRole) {
            // Si un EXPEDITEUR tente d'accéder à une page LIVREUR_GP
            if (requiredRole === 'LIVREUR_GP') {
                router.push('/');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, loading, requiredRole, router, redirectTo]);

    // Afficher un loader pendant le chargement
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    // Ne rien afficher si non autorisé (la redirection est en cours)
    if (!user || (requiredRole && user.role !== requiredRole)) {
        return null;
    }

    // Afficher le contenu si autorisé
    return <>{children}</>;
}
