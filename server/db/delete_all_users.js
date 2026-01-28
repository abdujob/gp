require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function deleteAllUsers() {
    console.log('⚠️  Suppression de tous les utilisateurs...\n');

    try {
        // Compter avant suppression
        const countBefore = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(countBefore.rows[0].count);

        const countAds = await pool.query('SELECT COUNT(*) FROM ads');
        const adsCount = parseInt(countAds.rows[0].count);

        console.log(`📊 Avant suppression:`);
        console.log(`   - Utilisateurs: ${userCount}`);
        console.log(`   - Annonces: ${adsCount}\n`);

        if (userCount === 0) {
            console.log('ℹ️  Aucun utilisateur à supprimer.\n');
            return;
        }

        // Supprimer tous les utilisateurs
        const result = await pool.query('DELETE FROM users');

        console.log(`✅ Suppression terminée!`);
        console.log(`   - ${result.rowCount} utilisateur(s) supprimé(s)\n`);

        // Vérifier après suppression
        const countAfter = await pool.query('SELECT COUNT(*) FROM users');
        const countAdsAfter = await pool.query('SELECT COUNT(*) FROM ads');

        console.log(`📊 Après suppression:`);
        console.log(`   - Utilisateurs restants: ${countAfter.rows[0].count}`);
        console.log(`   - Annonces restantes: ${countAdsAfter.rows[0].count}\n`);

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

deleteAllUsers()
    .then(() => {
        console.log('✅ Nettoyage terminé avec succès!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
