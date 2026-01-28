const express = require('express');
const router = express.Router();
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, async (req, res) => {
    try {
        // Compter les utilisateurs
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const usersTotal = parseInt(usersCount.rows[0].count);

        // Compter les utilisateurs par rôle
        const usersByRole = await pool.query(`
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role
        `);

        // Compter les annonces
        const adsCount = await pool.query('SELECT COUNT(*) FROM ads');
        const adsTotal = parseInt(adsCount.rows[0].count);

        // Compter les annonces actives (date disponible >= aujourd'hui)
        const activeAdsCount = await pool.query(`
            SELECT COUNT(*) FROM ads 
            WHERE available_date >= CURRENT_DATE
        `);
        const activeAdsTotal = parseInt(activeAdsCount.rows[0].count);

        // Statistiques des 7 derniers jours
        const recentUsers = await pool.query(`
            SELECT COUNT(*) FROM users 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        `);
        const recentUsersCount = parseInt(recentUsers.rows[0].count);

        const recentAds = await pool.query(`
            SELECT COUNT(*) FROM ads 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        `);
        const recentAdsCount = parseInt(recentAds.rows[0].count);

        res.json({
            users: {
                total: usersTotal,
                byRole: usersByRole.rows,
                recent: recentUsersCount
            },
            ads: {
                total: adsTotal,
                active: activeAdsTotal,
                recent: recentAdsCount
            }
        });

    } catch (err) {
        console.error('Admin stats error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `
            SELECT id, full_name, email, role, avatar_url, 
                   is_email_verified, provider, created_at
            FROM users
        `;
        let countQuery = 'SELECT COUNT(*) FROM users';
        const params = [];

        if (search) {
            query += ` WHERE full_name ILIKE $1 OR email ILIKE $1`;
            countQuery += ` WHERE full_name ILIKE $1 OR email ILIKE $1`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [users, count] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, search ? [`%${search}%`] : [])
        ]);

        const total = parseInt(count.rows[0].count);

        res.json({
            data: users.rows,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });

    } catch (err) {
        console.error('Admin get users error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;

        // Empêcher la suppression de son propre compte
        if (id === req.user.id) {
            return res.status(400).json({
                msg: 'Vous ne pouvez pas supprimer votre propre compte',
                code: 'CANNOT_DELETE_SELF'
            });
        }

        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING email',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                msg: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            msg: 'Utilisateur supprimé avec succès',
            email: result.rows[0].email
        });

    } catch (err) {
        console.error('Admin delete user error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   GET /api/admin/ads
// @desc    Get all ads with pagination
// @access  Private (Admin only)
router.get('/ads', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        let query = `
            SELECT ads.*, users.full_name as user_name, users.email as user_email
            FROM ads
            JOIN users ON ads.user_id = users.id
        `;
        let countQuery = 'SELECT COUNT(*) FROM ads';
        const params = [];

        if (search) {
            query += ` WHERE ads.title ILIKE $1 OR ads.description ILIKE $1`;
            countQuery += ` WHERE title ILIKE $1 OR description ILIKE $1`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY ads.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const [ads, count] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, search ? [`%${search}%`] : [])
        ]);

        const total = parseInt(count.rows[0].count);

        res.json({
            data: ads.rows,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });

    } catch (err) {
        console.error('Admin get ads error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

// @route   DELETE /api/admin/ads/:id
// @desc    Delete an ad
// @access  Private (Admin only)
router.delete('/ads/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM ads WHERE id = $1 RETURNING title',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                msg: 'Annonce non trouvée',
                code: 'AD_NOT_FOUND'
            });
        }

        res.json({
            msg: 'Annonce supprimée avec succès',
            title: result.rows[0].title
        });

    } catch (err) {
        console.error('Admin delete ad error:', err.message);
        res.status(500).json({
            msg: 'Erreur serveur',
            code: 'SERVER_ERROR'
        });
    }
});

module.exports = router;
