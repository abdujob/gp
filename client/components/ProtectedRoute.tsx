'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * Props du composant ProtectedRoute
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'EXPEDITEUR' | 'LIVREUR_GP' | 'ADMIN';
    allowedRoles?: Array<'EXPEDITEUR' | 'LIVREUR_GP' | 'ADMIN'>;
    redirectTo?: string;
}

/**
 * Composant HOC pour protéger les routes
 * Vérifie si l'utilisateur est connecté et a le rôle requis
 */
export default function ProtectedRoute({
    children,
    requiredRole,
    allowedRoles,
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

        // Vérifier les rôles autorisés
        const roles = allowedRoles || (requiredRole ? [requiredRole] : []);

        // Rediriger si le rôle ne correspond pas
        if (roles.length > 0 && !roles.includes(user.role)) {
            // Si un EXPEDITEUR tente d'accéder à une page LIVREUR_GP
            if (roles.includes('LIVREUR_GP') && !roles.includes('EXPEDITEUR')) {
                router.push('/');
            } else {
                router.push('/dashboard');
            }
        }
    }, [user, loading, requiredRole, allowedRoles, router, redirectTo]);

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

    // Vérifier les rôles autorisés
    const roles = allowedRoles || (requiredRole ? [requiredRole] : []);

    // Ne rien afficher si non autorisé (la redirection est en cours)
    if (!user || (roles.length > 0 && !roles.includes(user.role))) {
        return null;
    }

    // Afficher le contenu si autorisé
    return <>{children}</>;
}
