const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Route temporaire pour ajouter des données de test
router.post('/', async (req, res) => {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('BEGIN');

        // Créer un utilisateur test
        const passwordHash = await bcrypt.hash('password123', 10);
        const userResult = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone, address, is_email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING id
    `, [
            'Livreur Test',
            'livreur@test.com',
            passwordHash,
            'LIVREUR_GP',
            '+221 77 123 45 67',
            'Dakar, Sénégal',
            true
        ]);

        const userId = userResult.rows[0].id;

        // Créer des annonces
        const ads = [
            ['Livraison Dakar → Paris', 'Je voyage de Dakar à Paris le 15 janvier. Je peux transporter des colis jusqu\'à 20kg.', 'Dakar, Sénégal', 'Dakar', 14.6928, -17.4467, '2026-01-15', 'colis', '20 kg', 50.00],
            ['Transport Documents Dakar → Lyon', 'Voyage prévu pour le 20 janvier. Spécialisé dans le transport de documents importants.', 'Plateau, Dakar', 'Dakar', 14.6937, -17.4441, '2026-01-20', 'document', '5 kg', 30.00],
            ['Colis Dakar → Marseille', 'Départ le 25 janvier. Je peux prendre des colis jusqu\'à 15kg.', 'Almadies, Dakar', 'Dakar', 14.7392, -17.5003, '2026-01-25', 'colis', '15 kg', 45.00],
            ['Livraison Express Dakar → Toulouse', 'Service express disponible dès le 10 janvier.', 'Mermoz, Dakar', 'Dakar', 14.7167, -17.4667, '2026-01-10', 'autre', '10 kg', 40.00],
            ['Transport Colis Dakar → Bordeaux', 'Voyage régulier vers Bordeaux. Disponible le 18 janvier.', 'Ouakam, Dakar', 'Dakar', 14.7197, -17.4903, '2026-01-18', 'colis', '25 kg', 55.00]
        ];

        for (const ad of ads) {
            await client.query(`
        INSERT INTO ads (user_id, title, description, address, city, latitude, longitude, available_date, transport_type, weight_capacity, price)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [userId, ...ad]);
        }

        await client.query('COMMIT');

        const countResult = await client.query('SELECT COUNT(*) FROM ads');

        res.json({
            success: true,
            message: 'Données de test ajoutées avec succès',
            adsCount: countResult.rows[0].count
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur seed:', error);
        res.status(500).json({ error: error.message });
    } finally {
        await client.end();
    }
});

module.exports = router;
