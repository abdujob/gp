// Script pour initialiser la base de données RDS avec le schéma
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration RDS
const client = new Client({
    host: 'gp-database.catim6ga667r.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'gp_admin',
    password: 'GpSecurePass2026!',
    database: 'gp_db',
    ssl: {
        rejectUnauthorized: false // Pour RDS
    }
});

async function initializeDatabase() {
    try {
        console.log('🔌 Connexion à la base de données RDS...');
        await client.connect();
        console.log('✅ Connecté à RDS PostgreSQL !');

        // Lire le fichier schema.sql
        const schemaPath = path.join(__dirname, 'db', 'schema.sql');
        console.log(`📄 Lecture du schéma depuis : ${schemaPath}`);
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Exécuter le schéma
        console.log('🚀 Exécution du schéma SQL...');
        await client.query(schema);
        console.log('✅ Schéma créé avec succès !');

        // Vérifier les tables créées
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('\n📊 Tables créées :');
        result.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        console.log('\n🎉 Base de données initialisée avec succès !');
        console.log('\n📋 Informations de connexion :');
        console.log(`  Host: gp-database.catim6ga667r.us-east-1.rds.amazonaws.com`);
        console.log(`  Port: 5432`);
        console.log(`  Database: gp_db`);
        console.log(`  User: gp_admin`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation :', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Connexion fermée.');
    }
}

// Exécuter
initializeDatabase();
