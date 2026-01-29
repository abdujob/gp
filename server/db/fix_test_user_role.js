require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkUserRoles() {
    console.log('🔍 Vérification des rôles des utilisateurs...\n');

    try {
        const result = await pool.query(`
            SELECT email, full_name, role, provider, created_at
            FROM users
            WHERE email IN ('test@gp.com', 'gp.notifs@gmail.com')
            ORDER BY email
        `);

        console.log('📋 Utilisateurs trouvés:\n');

        result.rows.forEach(user => {
            console.log('═══════════════════════════════════════════');
            console.log(`📧 ${user.email}`);
            console.log(`   👤 Nom: ${user.full_name}`);
            console.log(`   🎭 Rôle: ${user.role}`);
            console.log(`   🔐 Provider: ${user.provider}`);
            console.log(`   📅 Créé le: ${user.created_at}`);
            console.log('');
        });

        // Changer le rôle de test@gp.com en EXPEDITEUR
        console.log('🔧 Changement du rôle de test@gp.com...\n');

        await pool.query(`
            UPDATE users
            SET role = 'EXPEDITEUR'
            WHERE email = 'test@gp.com'
        `);

        console.log('✅ Rôle changé: test@gp.com → EXPEDITEUR\n');

        // Vérifier à nouveau
        const updated = await pool.query(`
            SELECT email, role
            FROM users
            WHERE email = 'test@gp.com'
        `);

        console.log('📋 Vérification:');
        console.log(`   Email: ${updated.rows[0].email}`);
        console.log(`   Nouveau rôle: ${updated.rows[0].role}`);

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

checkUserRoles()
    .then(() => {
        console.log('\n✅ Terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
