require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrateAdsTable() {
    console.log('🔄 Migration de la table ads...\n');

    try {
        // 1. Ajouter les nouvelles colonnes
        console.log('1️⃣ Ajout des nouvelles colonnes...');

        await pool.query(`
            ALTER TABLE ads 
            ADD COLUMN IF NOT EXISTS departure_city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS arrival_city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS advertiser_name VARCHAR(255);
        `);
        console.log('   ✅ Colonnes ajoutées\n');

        // 2. Rendre description nullable
        console.log('2️⃣ Modification de la colonne description...');
        await pool.query(`
            ALTER TABLE ads 
            ALTER COLUMN description DROP NOT NULL;
        `);
        console.log('   ✅ Description maintenant optionnelle\n');

        // 3. Modifier transport_type pour accepter du texte (JSON)
        console.log('3️⃣ Modification de transport_type...');
        await pool.query(`
            ALTER TABLE ads 
            ALTER COLUMN transport_type TYPE TEXT;
        `);
        console.log('   ✅ transport_type modifié\n');

        // 4. Supprimer weight_capacity
        console.log('4️⃣ Suppression de weight_capacity...');
        await pool.query(`
            ALTER TABLE ads 
            DROP COLUMN IF EXISTS weight_capacity;
        `);
        console.log('   ✅ weight_capacity supprimé\n');

        // 5. Migrer les données existantes
        console.log('5️⃣ Migration des données existantes...');

        // Mettre à jour les annonces existantes
        const result = await pool.query(`
            UPDATE ads 
            SET 
                departure_city = COALESCE(departure_city, city),
                arrival_city = COALESCE(arrival_city, 'Destination'),
                transport_type = CASE 
                    WHEN transport_type LIKE '[%' THEN transport_type
                    ELSE '["' || transport_type || '"]'
                END
            WHERE departure_city IS NULL OR arrival_city IS NULL;
        `);

        console.log(`   ✅ ${result.rowCount} annonces migrées\n`);

        // 6. Vérifier la structure finale
        console.log('6️⃣ Vérification de la structure...');
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'ads'
            ORDER BY ordinal_position;
        `);

        console.log('   📋 Colonnes de la table ads:');
        columns.rows.forEach(col => {
            console.log(`      - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        console.log('\n✅ Migration terminée avec succès!\n');

    } catch (err) {
        console.error('❌ Erreur lors de la migration:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

migrateAdsTable()
    .then(() => {
        console.log('🎉 Migration complète!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec de la migration:', err);
        process.exit(1);
    });
