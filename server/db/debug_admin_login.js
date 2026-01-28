require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function debugLogin() {
    console.log('🔍 Debug de la connexion admin...\n');

    try {
        const email = 'gp.notifs@gmail.com';
        const password = 'Sandimb2026@';

        // 1. Vérifier si l'utilisateur existe
        console.log('1️⃣ Recherche de l\'utilisateur...');
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            console.log('❌ Utilisateur non trouvé!\n');
            return;
        }

        const user = userResult.rows[0];
        console.log('✅ Utilisateur trouvé!');
        console.log(`   Email: ${user.email}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Provider: ${user.provider}`);
        console.log(`   Email vérifié: ${user.is_email_verified}`);
        console.log(`   Tentatives échouées: ${user.failed_login_attempts || 0}`);
        console.log(`   Compte verrouillé: ${user.account_locked_until || 'Non'}\n`);

        // 2. Vérifier le provider
        console.log('2️⃣ Vérification du provider...');
        const localUserResult = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND provider = $2',
            [email, 'LOCAL']
        );

        if (localUserResult.rows.length === 0) {
            console.log('❌ Utilisateur LOCAL non trouvé!');
            console.log(`   Provider actuel: ${user.provider}`);
            console.log('   Le backend cherche un utilisateur avec provider = LOCAL\n');

            // Corriger le provider si nécessaire
            console.log('🔧 Correction du provider...');
            await pool.query(
                'UPDATE users SET provider = $1 WHERE id = $2',
                ['LOCAL', user.id]
            );
            console.log('✅ Provider mis à jour vers LOCAL\n');
        } else {
            console.log('✅ Provider LOCAL correct\n');
        }

        // 3. Tester le mot de passe
        console.log('3️⃣ Test du mot de passe...');
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            console.log('✅ Mot de passe correct!\n');
        } else {
            console.log('❌ Mot de passe incorrect!');
            console.log('🔧 Réinitialisation du mot de passe...');

            const newHash = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE users SET password_hash = $1, failed_login_attempts = 0, account_locked_until = NULL WHERE id = $2',
                [newHash, user.id]
            );

            console.log('✅ Mot de passe réinitialisé!\n');
        }

        // 4. Vérifier la contrainte de rôle
        console.log('4️⃣ Vérification de la contrainte de rôle...');
        const constraintResult = await pool.query(`
            SELECT con.conname, pg_get_constraintdef(con.oid)
            FROM pg_constraint con
            JOIN pg_class rel ON rel.oid = con.conrelid
            WHERE rel.relname = 'users' AND con.conname = 'users_role_check'
        `);

        if (constraintResult.rows.length > 0) {
            console.log('✅ Contrainte de rôle trouvée:');
            console.log(`   ${constraintResult.rows[0].pg_get_constraintdef}\n`);
        } else {
            console.log('⚠️  Contrainte de rôle non trouvée\n');
        }

        // 5. Résumé final
        console.log('═══════════════════════════════════════════');
        console.log('📋 RÉSUMÉ');
        console.log('═══════════════════════════════════════════');

        const finalCheck = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND provider = $2',
            [email, 'LOCAL']
        );

        if (finalCheck.rows.length > 0) {
            const u = finalCheck.rows[0];
            const pwdMatch = await bcrypt.compare(password, u.password_hash);

            console.log(`✅ Email: ${u.email}`);
            console.log(`✅ Provider: ${u.provider}`);
            console.log(`✅ Rôle: ${u.role}`);
            console.log(`${pwdMatch ? '✅' : '❌'} Mot de passe: ${pwdMatch ? 'Correct' : 'Incorrect'}`);
            console.log(`✅ Tentatives échouées: ${u.failed_login_attempts || 0}`);
            console.log(`✅ Compte verrouillé: ${u.account_locked_until ? 'Oui' : 'Non'}`);
            console.log('═══════════════════════════════════════════\n');

            if (pwdMatch && u.provider === 'LOCAL') {
                console.log('🎉 Tout est correct! La connexion devrait fonctionner.\n');
            } else {
                console.log('⚠️  Il y a encore des problèmes à résoudre.\n');
            }
        }

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

debugLogin()
    .then(() => {
        console.log('✅ Debug terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
