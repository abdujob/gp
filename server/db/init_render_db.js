require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// URL de la base Render
const DATABASE_URL = 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k';

async function initRenderDB() {
    console.log('🚀 Initialisation de la base de données Render...\n');

    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connecté à la base Render\n');

        // Lire et exécuter le schéma
        const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        console.log('📄 Exécution du schéma SQL...');
        await client.query(schemaSQL);
        console.log('✅ Schéma créé avec succès\n');

        console.log('🎉 Base de données initialisée !');
        console.log('\n📊 Prochaines étapes:');
        console.log('1. Exécuter: node generate_test_data.js');
        console.log('2. Exécuter: node add_destination_columns.js');
        console.log('3. Exécuter: node update_destinations.js');
        console.log('4. Exécuter: node update_phones.js');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
    } finally {
        await client.end();
    }
}

initRenderDB();
