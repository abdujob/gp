require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function compareAccounts() {
    console.log('🔍 Comparaison des comptes...\n');

    try {
        // Récupérer les deux comptes
        const result = await pool.query(
            `SELECT id, full_name, email, role, provider, is_email_verified, 
                    failed_login_attempts, account_locked_until, password_hash,
                    created_at
             FROM users 
             WHERE email IN ($1, $2)
             ORDER BY email`,
            ['test@gp.com', 'gp.notifs@gmail.com']
        );

        if (result.rows.length === 0) {
            console.log('❌ Aucun compte trouvé!\n');
            return;
        }

        console.log(`📊 ${result.rows.length} compte(s) trouvé(s)\n`);

        for (const user of result.rows) {
            console.log('═══════════════════════════════════════════');
            console.log(`📧 ${user.email}`);
            console.log('═══════════════════════════════════════════');
            console.log(`   👤 Nom: ${user.full_name}`);
            console.log(`   🎭 Rôle: ${user.role}`);
            console.log(`   🔐 Provider: ${user.provider}`);
            console.log(`   ✉️  Email vérifié: ${user.is_email_verified}`);
            console.log(`   🔢 Tentatives échouées: ${user.failed_login_attempts || 0}`);
            console.log(`   🔒 Verrouillé: ${user.account_locked_until || 'Non'}`);
            console.log(`   📅 Créé le: ${user.created_at}`);
            console.log(`   🔑 Hash (10 premiers car): ${user.password_hash.substring(0, 10)}...`);

            // Tester les mots de passe
            const passwords = user.email === 'test@gp.com'
                ? ['Test123456@']
                : ['Sandimb2026@', 'Admin123@'];

            console.log('\n   🧪 Test des mots de passe:');
            for (const pwd of passwords) {
                const match = await bcrypt.compare(pwd, user.password_hash);
                console.log(`      ${match ? '✅' : '❌'} "${pwd}": ${match ? 'MATCH' : 'NO MATCH'}`);
            }
            console.log('');
        }

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

compareAccounts()
    .then(() => {
        console.log('✅ Comparaison terminée!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
