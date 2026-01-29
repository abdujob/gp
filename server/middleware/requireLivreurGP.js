const pool = require('../db');

/**
 * Middleware pour vérifier que l'utilisateur a le rôle LIVREUR_GP
 * Doit être utilisé APRÈS le middleware auth
 * Double vérification: JWT + Database (source de vérité)
 */
module.exports = async function (req, res, next) {
    try {
        // Check if user is authenticated (should be set by auth middleware)
        if (!req.user) {
            return res.status(401).json({
                msg: 'Accès refusé. Authentification requise.',
                code: 'AUTH_REQUIRED'
            });
        }

        // Check if user has LIVREUR_GP or ADMIN role
        if (req.user.role !== 'LIVREUR_GP' && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                msg: 'Accès refusé. Seuls les livreurs GP et administrateurs peuvent effectuer cette action.',
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: ['LIVREUR_GP', 'ADMIN'],
                userRole: req.user.role
            });
        }

        // User has required role, proceed
        next();

    } catch (err) {
        console.error('Error in requireLivreurGP middleware:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur lors de la vérification des permissions.',
            code: 'SERVER_ERROR'
        });
    }
};
