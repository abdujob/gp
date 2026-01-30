require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function deleteAd() {
    const adId = 'ba7a8a2d-949d-49a7-b232-03e62a2c3040';

    console.log('🗑️  Suppression de l\'annonce...\n');

    try {
        // Afficher l'annonce avant suppression
        const adResult = await pool.query(
            'SELECT title, departure_city, arrival_city FROM ads WHERE id = $1',
            [adId]
        );

        if (adResult.rows.length === 0) {
            console.log('❌ Annonce non trouvée\n');
            return;
        }

        const ad = adResult.rows[0];
        console.log('📦 Annonce à supprimer:');
        console.log(`   Titre: ${ad.title}`);
        console.log(`   Trajet: ${ad.departure_city} → ${ad.arrival_city}\n`);

        // Supprimer l'annonce
        const deleteResult = await pool.query(
            'DELETE FROM ads WHERE id = $1',
            [adId]
        );

        console.log(`✅ Annonce supprimée avec succès!\n`);

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

deleteAd()
    .then(() => {
        console.log('✅ Terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
