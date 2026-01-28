require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkAdminAccount() {
    console.log('🔍 Vérification du compte admin...\n');

    try {
        const email = 'gp.notifs@gmail.com';

        // Vérifier si le compte existe
        const result = await pool.query(
            'SELECT id, full_name, email, role, is_email_verified, provider, created_at FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('❌ Aucun compte trouvé avec cet email!\n');
            return;
        }

        const user = result.rows[0];

        console.log('✅ Compte trouvé!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📋 INFORMATIONS DU COMPTE');
        console.log('═══════════════════════════════════════════');
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   👤 Nom: ${user.full_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🎭 Rôle: ${user.role}`);
        console.log(`   ✉️  Email vérifié: ${user.is_email_verified}`);
        console.log(`   🔐 Provider: ${user.provider}`);
        console.log(`   📅 Créé le: ${user.created_at}`);
        console.log('═══════════════════════════════════════════\n');

        // Vérifier tous les utilisateurs
        const allUsers = await pool.query('SELECT email, role FROM users');
        console.log(`📊 Total d'utilisateurs: ${allUsers.rows.length}\n`);

        allUsers.rows.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.email} (${u.role})`);
        });
        console.log('');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

checkAdminAccount()
    .then(() => {
        console.log('✅ Vérification terminée!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
