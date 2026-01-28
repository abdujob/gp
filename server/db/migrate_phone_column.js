require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    console.log('📝 Migration: Ajout de la colonne phone à la table ads...\n');

    try {
        // Vérifier si la colonne existe déjà
        const checkColumn = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ads' AND column_name = 'phone'
        `);

        if (checkColumn.rows.length > 0) {
            console.log('ℹ️  La colonne phone existe déjà dans la table ads.\n');
        } else {
            // Ajouter la colonne phone
            await pool.query('ALTER TABLE ads ADD COLUMN phone VARCHAR(20)');
            console.log('✅ Colonne phone ajoutée avec succès à la table ads!\n');
        }

        // Optionnel: Supprimer tous les utilisateurs
        console.log('⚠️  Voulez-vous supprimer tous les utilisateurs existants?');
        console.log('   Pour supprimer, exécutez: DELETE FROM users;\n');

    } catch (err) {
        console.error('❌ Erreur lors de la migration:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

// Exécuter la migration
runMigration()
    .then(() => {
        console.log('✅ Migration terminée avec succès!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec de la migration:', err);
        process.exit(1);
    });
