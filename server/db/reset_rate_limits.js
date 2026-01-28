require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function resetRateLimits() {
    console.log('🔧 Réinitialisation des limites de taux...\n');

    try {
        const email = 'gp.notifs@gmail.com';

        // Réinitialiser les tentatives échouées et le verrouillage
        const result = await pool.query(
            `UPDATE users 
             SET failed_login_attempts = 0, 
                 account_locked_until = NULL 
             WHERE email = $1
             RETURNING email, failed_login_attempts, account_locked_until`,
            [email]
        );

        if (result.rows.length > 0) {
            console.log('✅ Limites réinitialisées pour:', result.rows[0].email);
            console.log('   Tentatives échouées:', result.rows[0].failed_login_attempts);
            console.log('   Verrouillé jusqu\'à:', result.rows[0].account_locked_until || 'Non verrouillé');
        } else {
            console.log('⚠️  Utilisateur non trouvé');
        }

        console.log('\n✅ Vous pouvez maintenant réessayer de vous connecter!\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

resetRateLimits()
    .then(() => {
        console.log('✅ Opération terminée!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
