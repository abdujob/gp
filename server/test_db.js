require('dotenv').config();
const { Pool } = require('pg');

async function testDB() {
    console.log('\n🔍 Test de connexion à la base de données...\n');

    console.log('Configuration:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Test 1: Connexion
        console.log('\n1. Test de connexion...');
        const client = await pool.connect();
        console.log('✅ Connexion réussie');

        // Test 2: Vérifier la table users
        console.log('\n2. Vérification de la table users...');
        const tableCheck = await client.query(`
            SELECT column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        console.log('✅ Table users existe');
        console.log('\nColonnes:');
        tableCheck.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });

        // Test 3: Compter les utilisateurs
        console.log('\n3. Nombre d\'utilisateurs...');
        const countRes = await client.query('SELECT COUNT(*) FROM users');
        console.log(`✅ ${countRes.rows[0].count} utilisateur(s) en base`);

        // Test 4: Vérifier les rôles
        console.log('\n4. Distribution des rôles...');
        const rolesRes = await client.query('SELECT role, COUNT(*) FROM users GROUP BY role');
        console.table(rolesRes.rows);

        client.release();
        await pool.end();

        console.log('\n✅ Tous les tests passés - La DB est opérationnelle\n');

    } catch (err) {
        console.error('\n❌ Erreur:', err.message);
        console.error('Code:', err.code);
        console.error('Détails:', err.detail);
        await pool.end();
    }
}

testDB();
