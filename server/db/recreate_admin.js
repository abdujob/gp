require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function recreateAdminAccount() {
    console.log('🔧 Recréation du compte admin...\n');

    try {
        const email = 'gp.notifs@gmail.com';
        const password = 'Sandimb2026@';
        const full_name = 'SA Ndimb';
        const role = 'ADMIN';

        // 1. Supprimer l'ancien compte
        console.log('1️⃣ Suppression de l\'ancien compte...');
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        console.log('   ✅ Ancien compte supprimé\n');

        // 2. Créer le nouveau hash avec la même méthode que le backend
        console.log('2️⃣ Création du hash de mot de passe...');
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        console.log('   ✅ Hash créé\n');

        // 3. Créer le nouveau compte
        console.log('3️⃣ Création du nouveau compte admin...');
        const result = await pool.query(
            `INSERT INTO users (
                full_name, email, password_hash, role,
                provider, is_email_verified,
                failed_login_attempts, account_locked_until
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, full_name, email, role, provider, is_email_verified, created_at`,
            [full_name, email, password_hash, role, 'LOCAL', true, 0, null]
        );

        const user = result.rows[0];
        console.log('   ✅ Compte créé!\n');

        // 4. Vérifier immédiatement le mot de passe
        console.log('4️⃣ Vérification du mot de passe...');
        const isMatch = await bcrypt.compare(password, password_hash);
        console.log(`   ${isMatch ? '✅' : '❌'} Mot de passe: ${isMatch ? 'Correct' : 'Incorrect'}\n`);

        // 5. Afficher les informations
        console.log('═══════════════════════════════════════════');
        console.log('📋 NOUVEAU COMPTE ADMIN');
        console.log('═══════════════════════════════════════════');
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   👤 Nom: ${user.full_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Mot de passe: ${password}`);
        console.log(`   🎭 Rôle: ${user.role}`);
        console.log(`   🔐 Provider: ${user.provider}`);
        console.log(`   ✉️  Email vérifié: ${user.is_email_verified}`);
        console.log(`   📅 Créé le: ${user.created_at}`);
        console.log('═══════════════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

recreateAdminAccount()
    .then(() => {
        console.log('✅ Compte admin recréé avec succès!\n');
        console.log('🧪 Testez maintenant la connexion.\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
