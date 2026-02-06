const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.email !== 'gp.notifs@gmail.com') {
        return res.status(403).json({ msg: 'Accès refusé. Admin seulement.' });
    }
    next();
};

// @route   GET /api/delivery-persons
// @desc    Get all delivery persons
// @access  Private (Admin only)
router.get('/', auth, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM delivery_persons ORDER BY nom ASC'
        );

        res.json({
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching delivery persons:', err.message);
        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

// @route   POST /api/delivery-persons
// @desc    Add or update delivery person
// @access  Private (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
    const { nom, telephone, ville_depart, ville_arrivee, prix } = req.body;

    // Validation
    if (!nom || !telephone || !ville_depart || !ville_arrivee || !prix) {
        return res.status(400).json({ msg: 'Tous les champs sont requis' });
    }

    try {
        // Check if delivery person already exists (case-insensitive)
        const existingPerson = await pool.query(
            'SELECT * FROM delivery_persons WHERE LOWER(nom) = LOWER($1) AND telephone = $2',
            [nom, telephone]
        );

        let result;
        if (existingPerson.rows.length > 0) {
            // Update existing person
            result = await pool.query(
                `UPDATE delivery_persons 
                 SET ville_depart = $1, ville_arrivee = $2, prix = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE LOWER(nom) = LOWER($4) AND telephone = $5
                 RETURNING *`,
                [ville_depart, ville_arrivee, prix, nom, telephone]
            );
        } else {
            // Insert new person
            result = await pool.query(
                `INSERT INTO delivery_persons (nom, telephone, ville_depart, ville_arrivee, prix)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [nom, telephone, ville_depart, ville_arrivee, prix]
            );
        }

        res.status(201).json({
            msg: 'Livreur enregistré avec succès',
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error saving delivery person:', err.message);

        // Handle unique constraint violation
        if (err.code === '23505') {
            return res.status(400).json({ msg: 'Ce livreur existe déjà' });
        }

        res.status(500).json({ msg: 'Erreur serveur' });
    }
});

module.exports = router;
