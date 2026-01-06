require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k',
    ssl: { rejectUnauthorized: false }
});

async function addDestinationColumns() {
    console.log('🔧 Ajout des colonnes de destination à la table ads...\n');

    try {
        // Ajouter les colonnes
        await pool.query(`
            ALTER TABLE ads 
            ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS destination_lat DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS destination_lng DOUBLE PRECISION
        `);

        console.log('✅ Colonnes ajoutées avec succès\n');

        // Vérifier la structure
        const columns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ads' 
            AND column_name LIKE '%destination%'
        `);

        console.log('📋 Nouvelles colonnes:');
        console.table(columns.rows);

        console.log('\n💡 Prochaine étape: Mettre à jour les annonces existantes avec les destinations');

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

addDestinationColumns();
