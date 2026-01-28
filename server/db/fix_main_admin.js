require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixMainAdminAccount() {
    console.log('🔧 Configuration du compte admin principal...\n');

    try {
        // 1. Supprimer les deux comptes
        console.log('1️⃣ Nettoyage des comptes existants...');
        await pool.query('DELETE FROM users WHERE email IN ($1, $2)',
            ['gp.notifs@gmail.com', 'admin@gp.com']);
        console.log('   ✅ Comptes supprimés\n');

        // 2. Créer le compte principal avec le bon email
        console.log('2️⃣ Création du compte admin principal...');

        const email = 'gp.notifs@gmail.com';
        const password = 'Sandimb2026@';
        const full_name = 'SA Ndimb';
        const role = 'LIVREUR_GP'; // Temporairement pour que le frontend accepte

        // Créer le hash exactement comme le backend
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Vérifier le hash
        const testMatch = await bcrypt.compare(password, password_hash);
        console.log(`   🔑 Vérification du hash: ${testMatch ? '✅ OK' : '❌ FAIL'}`);

        if (!testMatch) {
            throw new Error('Le hash du mot de passe ne fonctionne pas!');
        }

        // Créer le compte
        const result = await pool.query(
            `INSERT INTO users (
                full_name, email, password_hash, role,
                provider, is_email_verified,
                failed_login_attempts, account_locked_until
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, full_name, email, role, created_at`,
            [full_name, email, password_hash, role, 'LOCAL', true, 0, null]
        );

        const user = result.rows[0];
        console.log('   ✅ Compte créé!\n');

        // 3. Tester immédiatement avec l'API
        console.log('3️⃣ Test de connexion avec l\'API...');
        const axios = require('axios');

        try {
            const apiResponse = await axios.post(
                'https://gp-backend-skwd.onrender.com/api/auth/login',
                { email, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            console.log('   ✅ Test API réussi! Status:', apiResponse.status);
            console.log('   👤 Utilisateur:', apiResponse.data.user?.full_name);
            console.log('   🔑 Token reçu:', apiResponse.data.accessToken ? 'Oui' : 'Non');

        } catch (apiError) {
            console.log('   ❌ Test API échoué:', apiError.response?.status || apiError.message);
            if (apiError.response?.data) {
                console.log('   Message:', apiError.response.data.msg);
            }
        }

        console.log('\n═══════════════════════════════════════════');
        console.log('✅ COMPTE ADMIN PRINCIPAL');
        console.log('═══════════════════════════════════════════');
        console.log(`   👤 Nom: ${user.full_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Mot de passe: ${password}`);
        console.log(`   🎭 Rôle: ${user.role} (temporaire)`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log('═══════════════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

fixMainAdminAccount()
    .then(() => {
        console.log('✅ Configuration terminée!\n');
        console.log('🎯 Vous pouvez maintenant vous connecter avec gp.notifs@gmail.com\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
