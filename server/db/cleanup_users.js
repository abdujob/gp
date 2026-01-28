const pool = require('./index');

/**
 * Script pour supprimer tous les utilisateurs de la base de données
 * ATTENTION: Cette action est irréversible et supprimera également toutes les annonces associées
 */
async function cleanupUsers() {
    console.log('⚠️  ATTENTION: Suppression de tous les utilisateurs...\n');

    try {
        // Compter les utilisateurs avant suppression
        const countBefore = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(countBefore.rows[0].count);

        const countAds = await pool.query('SELECT COUNT(*) FROM ads');
        const adsCount = parseInt(countAds.rows[0].count);

        console.log(`📊 Statistiques avant suppression:`);
        console.log(`   - Utilisateurs: ${userCount}`);
        console.log(`   - Annonces: ${adsCount}\n`);

        if (userCount === 0) {
            console.log('✅ Aucun utilisateur à supprimer.\n');
            return;
        }

        // Supprimer tous les utilisateurs (CASCADE supprimera aussi les annonces)
        await pool.query('DELETE FROM users');

        console.log('✅ Suppression terminée avec succès!\n');
        console.log(`   - ${userCount} utilisateur(s) supprimé(s)`);
        console.log(`   - ${adsCount} annonce(s) supprimée(s)\n`);

    } catch (err) {
        console.error('❌ Erreur lors de la suppression:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

// Exécuter le script
cleanupUsers();
