/**
 * Utilitaire pour gérer les erreurs API de manière cohérente
 */

interface ApiError {
    response?: {
        status: number;
        data?: {
            msg?: string;
            errors?: Array<{ msg: string; param: string }>;
        };
    };
    message?: string;
}

/**
 * Convertit une erreur API en message utilisateur lisible
 */
export const handleApiError = (error: ApiError): string => {
    // Erreur de validation (400)
    if (error.response?.status === 400) {
        const errors = error.response.data?.errors;
        if (errors && errors.length > 0) {
            return errors.map(e => e.msg).join(', ');
        }
        return error.response.data?.msg || 'Données invalides';
    }

    // Non autorisé (401)
    if (error.response?.status === 401) {
        return 'Session expirée, veuillez vous reconnecter';
    }

    // Accès refusé (403)
    if (error.response?.status === 403) {
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    }

    // Ressource introuvable (404)
    if (error.response?.status === 404) {
        return 'Ressource introuvable';
    }

    // Conflit (409)
    if (error.response?.status === 409) {
        return error.response.data?.msg || 'Conflit détecté';
    }

    // Erreur serveur (500+)
    if (error.response?.status && error.response.status >= 500) {
        return 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    // Erreur réseau
    if (!error.response) {
        return 'Erreur de connexion. Vérifiez votre connexion internet.';
    }

    // Message par défaut
    return error.response?.data?.msg || error.message || 'Une erreur est survenue';
};

/**
 * Affiche un message d'erreur formaté
 */
export const formatErrorMessage = (error: ApiError): { title: string; message: string } => {
    const status = error.response?.status;

    if (status === 401) {
        return {
            title: 'Authentification requise',
            message: handleApiError(error)
        };
    }

    if (status === 403) {
        return {
            title: 'Accès refusé',
            message: handleApiError(error)
        };
    }

    if (status === 404) {
        return {
            title: 'Introuvable',
            message: handleApiError(error)
        };
    }

    if (status && status >= 500) {
        return {
            title: 'Erreur serveur',
            message: handleApiError(error)
        };
    }

    return {
        title: 'Erreur',
        message: handleApiError(error)
    };
};
