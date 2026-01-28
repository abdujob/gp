require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testAdminLogin() {
    console.log('🔐 Test de connexion admin...\n');

    try {
        const email = 'gp.notifs@gmail.com';
        const password = 'Sandimb2026@';

        // Récupérer l'utilisateur
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            console.log('❌ Utilisateur non trouvé!\n');
            return;
        }

        const user = result.rows[0];

        console.log('📋 Informations utilisateur:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Provider: ${user.provider}`);
        console.log(`   Email vérifié: ${user.is_email_verified}`);
        console.log(`   Tentatives échouées: ${user.failed_login_attempts || 0}`);
        console.log(`   Compte verrouillé: ${user.account_locked_until || 'Non'}\n`);

        // Tester le mot de passe
        console.log('🔑 Test du mot de passe...');
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            console.log('✅ Mot de passe correct!\n');
        } else {
            console.log('❌ Mot de passe incorrect!\n');
            console.log('🔧 Réinitialisation du mot de passe...');

            // Réinitialiser le mot de passe
            const newHash = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE users SET password_hash = $1, failed_login_attempts = 0, account_locked_until = NULL WHERE id = $2',
                [newHash, user.id]
            );

            console.log('✅ Mot de passe réinitialisé avec succès!\n');

            // Vérifier à nouveau
            const verifyResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [user.id]);
            const finalCheck = await bcrypt.compare(password, verifyResult.rows[0].password_hash);

            if (finalCheck) {
                console.log('✅ Vérification finale: Mot de passe fonctionne maintenant!\n');
            } else {
                console.log('❌ Erreur: Le mot de passe ne fonctionne toujours pas!\n');
            }
        }

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

testAdminLogin()
    .then(() => {
        console.log('✅ Test terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
