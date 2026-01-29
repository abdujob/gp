require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixUserRoles() {
    console.log('🔧 Correction des rôles utilisateurs...\n');

    try {
        // 1. Changer test@gp.com en ADMIN
        console.log('1️⃣ Changement de test@gp.com → ADMIN');
        await pool.query(`
            UPDATE users
            SET role = 'ADMIN'
            WHERE email = 'test@gp.com'
        `);
        console.log('   ✅ test@gp.com est maintenant ADMIN\n');

        // 2. Garder gp.notifs@gmail.com en LIVREUR_GP
        console.log('2️⃣ Vérification de gp.notifs@gmail.com → LIVREUR_GP');
        await pool.query(`
            UPDATE users
            SET role = 'LIVREUR_GP'
            WHERE email = 'gp.notifs@gmail.com'
        `);
        console.log('   ✅ gp.notifs@gmail.com reste LIVREUR_GP\n');

        // 3. Vérifier les rôles finaux
        console.log('3️⃣ Vérification des rôles finaux:\n');
        const result = await pool.query(`
            SELECT email, full_name, role
            FROM users
            WHERE email IN ('test@gp.com', 'gp.notifs@gmail.com')
            ORDER BY email
        `);

        result.rows.forEach(user => {
            console.log('═══════════════════════════════════════════');
            console.log(`📧 ${user.email}`);
            console.log(`   👤 Nom: ${user.full_name}`);
            console.log(`   🎭 Rôle: ${user.role}`);

            if (user.role === 'ADMIN') {
                console.log('   ✅ Administrateur - Peut gérer les annonces');
                console.log('   ✅ Doit renseigner le nom du livreur');
            } else if (user.role === 'LIVREUR_GP') {
                console.log('   ✅ Livreur - Poste ses propres annonces');
                console.log('   ✅ Son nom est utilisé automatiquement');
            }
            console.log('');
        });

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

fixUserRoles()
    .then(() => {
        console.log('✅ Rôles corrigés avec succès!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
