require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createSimpleAdmin() {
    console.log('🔧 Création d\'un compte admin simple...\n');

    try {
        // Utiliser un email différent pour éviter les conflits
        const email = 'admin@gp.com';
        const password = 'Admin123@';
        const full_name = 'Administrateur GP';
        const role = 'LIVREUR_GP'; // Temporairement LIVREUR_GP pour que le frontend accepte

        // Supprimer si existe
        await pool.query('DELETE FROM users WHERE email = $1', [email]);
        console.log('✅ Ancien compte supprimé (si existait)\n');

        // Créer le hash exactement comme le backend le fait
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Vérifier immédiatement
        const testMatch = await bcrypt.compare(password, password_hash);
        console.log(`🔑 Test du hash: ${testMatch ? '✅ OK' : '❌ FAIL'}\n`);

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

        console.log('═══════════════════════════════════════════');
        console.log('✅ NOUVEAU COMPTE ADMIN CRÉÉ');
        console.log('═══════════════════════════════════════════');
        console.log(`   👤 Nom: ${user.full_name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Mot de passe: ${password}`);
        console.log(`   🎭 Rôle: ${user.role}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log('═══════════════════════════════════════════\n');

        console.log('🧪 Testez maintenant avec ces identifiants!\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

createSimpleAdmin()
    .then(() => {
        console.log('✅ Terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
