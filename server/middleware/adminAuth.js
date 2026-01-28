const auth = require('./auth');

/**
 * Middleware pour vérifier que l'utilisateur est administrateur
 */
const adminAuth = (req, res, next) => {
    // D'abord vérifier l'authentification
    auth(req, res, (err) => {
        if (err) {
            return next(err);
        }

        // Vérifier si l'utilisateur a le rôle ADMIN
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                msg: 'Accès refusé. Droits administrateur requis.',
                code: 'ADMIN_REQUIRED'
            });
        }

        next();
    });
};

module.exports = adminAuth;
