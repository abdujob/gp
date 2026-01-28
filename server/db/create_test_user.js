require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTestAccount() {
    console.log('👤 Création d\'un compte de test LIVREUR_GP...\n');

    try {
        const email = 'test@gp.com';
        const password = 'Test123456@';
        const full_name = 'Test User';
        const role = 'LIVREUR_GP'; // Rôle accepté par l'ancienne version

        // Supprimer si existe déjà
        await pool.query('DELETE FROM users WHERE email = $1', [email]);

        // Hasher le mot de passe
        const password_hash = await bcrypt.hash(password, 10);

        // Créer l'utilisateur
        const result = await pool.query(
            `INSERT INTO users (
                full_name, email, password_hash, role,
                provider, is_email_verified
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, full_name, email, role, created_at`,
            [full_name, email, password_hash, role, 'LOCAL', true]
        );

        const user = result.rows[0];

        console.log('✅ Compte de test créé!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📋 COMPTE DE TEST');
        console.log('═══════════════════════════════════════════');
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Mot de passe: ${password}`);
        console.log(`   🎭 Rôle: ${user.role}`);
        console.log(`   👤 Nom: ${user.full_name}`);
        console.log('═══════════════════════════════════════════\n');

        console.log('🧪 Testez la connexion avec ce compte pour vérifier que le backend fonctionne.\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

createTestAccount()
    .then(() => {
        console.log('✅ Terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
