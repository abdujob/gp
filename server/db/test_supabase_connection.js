const { Pool } = require('pg');

// Test de connexion à Supabase
const pool = new Pool({
    connectionString: 'postgresql://postgres.quogoyzlifsxrrgbdtmj:NjOzcXkIUDUO9TPC@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    console.log('🔍 Test de connexion à Supabase...\n');

    try {
        // Test 1: Connexion simple
        const client = await pool.connect();
        console.log('✅ Connexion établie avec succès!');

        // Test 2: Compter les utilisateurs
        const result = await client.query('SELECT COUNT(*) FROM users');
        console.log(`✅ Nombre d'utilisateurs: ${result.rows[0].count}`);

        // Test 3: Lister les utilisateurs
        const users = await client.query('SELECT email, role FROM users');
        console.log('\n📋 Utilisateurs dans la base:');
        users.rows.forEach(user => {
            console.log(`   - ${user.email} (${user.role})`);
        });

        client.release();
        console.log('\n🎉 Tous les tests réussis!\n');

    } catch (err) {
        console.error('❌ Erreur de connexion:', err.message);
        console.error('Code:', err.code);
        console.error('\nDétails complets:', err);
    } finally {
        await pool.end();
    }
}

testConnection();
