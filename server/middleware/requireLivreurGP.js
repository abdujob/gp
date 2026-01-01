const pool = require('../db');

/**
 * Middleware pour vérifier que l'utilisateur a le rôle LIVREUR_GP
 * Doit être utilisé APRÈS le middleware auth
 * Double vérification: JWT + Database (source de vérité)
 */
module.exports = async function (req, res, next) {
    try {
        // Vérifier d'abord le rôle depuis le JWT (performance)
        if (req.user.role && req.user.role === 'LIVREUR_GP') {
            return next();
        }

        // Double vérification depuis la DB (sécurité)
        const userResult = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const dbRole = userResult.rows[0].role;

        if (dbRole !== 'LIVREUR_GP') {
            return res.status(403).json({
                msg: 'Access denied: LIVREUR_GP role required',
                required_role: 'LIVREUR_GP',
                user_role: dbRole
            });
        }

        // Synchroniser le rôle dans req.user si différent
        req.user.role = dbRole;
        next();

    } catch (err) {
        console.error('Error in requireLivreurGP middleware:', err.message);
        res.status(500).send('Server Error');
    }
};
