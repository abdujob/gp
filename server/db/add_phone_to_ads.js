const pool = require('./index');

/**
 * Script pour ajouter la colonne phone à la table ads
 */
async function addPhoneToAds() {
    console.log('📝 Ajout de la colonne phone à la table ads...\n');

    try {
        // Vérifier si la colonne existe déjà
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ads' AND column_name = 'phone'
        `);

        if (checkColumn.rows.length > 0) {
            console.log('ℹ️  La colonne phone existe déjà dans la table ads.\n');
            return;
        }

        // Ajouter la colonne phone
        await pool.query('ALTER TABLE ads ADD COLUMN phone VARCHAR(20)');

        console.log('✅ Colonne phone ajoutée avec succès à la table ads!\n');

    } catch (err) {
        console.error('❌ Erreur lors de l\'ajout de la colonne:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

// Exécuter le script
addPhoneToAds();
