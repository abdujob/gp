const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const pool = require('./index');

async function addPerformanceIndexes() {
    console.log('🚀 Ajout des index de performance à la table ads...\n');

    try {
        // 1. Index sur les villes (recherche fréquente)
        console.log('⏳ Création de l\'index sur departure_city...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ads_departure_city ON ads (LOWER(departure_city))');

        console.log('⏳ Création de l\'index sur arrival_city...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ads_arrival_city ON ads (LOWER(arrival_city))');

        // 2. Index sur la date de disponibilité (filtre fréquent)
        console.log('⏳ Création de l\'index sur available_date...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ads_available_date ON ads (available_date)');

        // 3. Index sur la date de création (tri par défaut)
        console.log('⏳ Création de l\'index sur created_at...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads (created_at DESC)');

        // 4. Index sur le user_id (affichage "Mes annonces")
        console.log('⏳ Création de l\'index sur user_id...');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads (user_id)');

        console.log('\n✅ Tous les index ont été créés avec succès !');

        // Vérification
        const result = await pool.query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'ads'
        `);
        console.log('\n📋 Liste des index actuels :');
        console.table(result.rows);

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur lors de la création des index :');
        console.error(err);
        process.exit(1);
    }
}

addPerformanceIndexes();
