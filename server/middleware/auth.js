const jwt = require('jsonwebtoken');
const pool = require('../db');
const { isAccountLocked } = require('../utils/authUtils');

/**
 * Enhanced JWT Authentication Middleware
 * Verifies JWT token, checks user existence, and account lock status
 */
module.exports = async function (req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            msg: 'Accès refusé. Aucun token fourni.',
            code: 'NO_TOKEN'
        });
    }

    try {
        // Remove 'Bearer ' prefix if present
        const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

        // Verify token
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);

        // Check if token is a refresh token (should not be used for API access)
        if (decoded.user.type === 'refresh') {
            return res.status(401).json({
                msg: 'Token invalide. Utilisez un access token.',
                code: 'INVALID_TOKEN_TYPE'
            });
        }

        // Verify user still exists in database
        const userResult = await pool.query(
            'SELECT id, email, role, is_email_verified, account_locked_until, failed_login_attempts FROM users WHERE id = $1',
            [decoded.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                msg: 'Utilisateur non trouvé. Token invalide.',
                code: 'USER_NOT_FOUND'
            });
        }

        const user = userResult.rows[0];

        // Check if account is locked
        if (isAccountLocked(user)) {
            const lockUntil = new Date(user.account_locked_until);
            return res.status(403).json({
                msg: 'Compte temporairement verrouillé suite à plusieurs tentatives de connexion échouées.',
                code: 'ACCOUNT_LOCKED',
                lockedUntil: lockUntil.toISOString()
            });
        }

        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.is_email_verified
        };

        next();

    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                msg: 'Token expiré. Veuillez vous reconnecter.',
                code: 'TOKEN_EXPIRED',
                expiredAt: err.expiredAt
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                msg: 'Token invalide.',
                code: 'INVALID_TOKEN'
            });
        }

        // Generic error
        console.error('Auth middleware error:', err.message);
        res.status(401).json({
            msg: 'Erreur d\'authentification.',
            code: 'AUTH_ERROR'
        });
    }
};
