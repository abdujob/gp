require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function changeAdminRole() {
    console.log('🔧 Changement du rôle admin en LIVREUR_GP...\n');

    try {
        const email = 'gp.notifs@gmail.com';

        // Changer le rôle en LIVREUR_GP (accepté par le frontend)
        const result = await pool.query(
            `UPDATE users 
             SET role = 'LIVREUR_GP',
                 failed_login_attempts = 0,
                 account_locked_until = NULL
             WHERE email = $1
             RETURNING id, full_name, email, role`,
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ Rôle modifié avec succès!\n');
            console.log('═══════════════════════════════════════════');
            console.log('📋 COMPTE ADMIN (TEMPORAIRE)');
            console.log('═══════════════════════════════════════════');
            console.log(`   👤 Nom: ${user.full_name}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   🔑 Mot de passe: Sandimb2026@`);
            console.log(`   🎭 Rôle: ${user.role} (temporaire)`);
            console.log('═══════════════════════════════════════════\n');

            console.log('ℹ️  Note: Le rôle est temporairement LIVREUR_GP');
            console.log('   pour que le frontend accepte la connexion.');
            console.log('   Une fois le frontend redéployé, nous le');
            console.log('   remettrons en ADMIN.\n');
        } else {
            console.log('⚠️  Utilisateur non trouvé\n');
        }

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

changeAdminRole()
    .then(() => {
        console.log('✅ Vous pouvez maintenant vous connecter!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
