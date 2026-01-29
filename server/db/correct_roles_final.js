require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function correctRoles() {
    console.log('🔧 CORRECTION DES RÔLES (INVERSÉS)\n');
    console.log('═══════════════════════════════════════════\n');

    try {
        // CORRECTION : Inverser les rôles
        console.log('1️⃣ gp.notifs@gmail.com → ADMIN (Administrateur)');
        await pool.query(`
            UPDATE users
            SET role = 'ADMIN'
            WHERE email = 'gp.notifs@gmail.com'
        `);
        console.log('   ✅ gp.notifs@gmail.com est maintenant ADMIN\n');

        console.log('2️⃣ test@gp.com → LIVREUR_GP (Livreur)');
        await pool.query(`
            UPDATE users
            SET role = 'LIVREUR_GP'
            WHERE email = 'test@gp.com'
        `);
        console.log('   ✅ test@gp.com est maintenant LIVREUR_GP\n');

        // Vérification
        console.log('3️⃣ Vérification des rôles:\n');
        const result = await pool.query(`
            SELECT email, full_name, role
            FROM users
            WHERE email IN ('test@gp.com', 'gp.notifs@gmail.com')
            ORDER BY 
                CASE 
                    WHEN role = 'ADMIN' THEN 1
                    WHEN role = 'LIVREUR_GP' THEN 2
                    ELSE 3
                END
        `);

        result.rows.forEach(user => {
            console.log('═══════════════════════════════════════════');
            console.log(`📧 ${user.email}`);
            console.log(`   👤 Nom: ${user.full_name}`);
            console.log(`   🎭 Rôle: ${user.role}`);

            if (user.role === 'ADMIN') {
                console.log('   ✅ ADMINISTRATEUR');
                console.log('   → Peut gérer les annonces');
                console.log('   → DOIT renseigner le nom du livreur');
            } else if (user.role === 'LIVREUR_GP') {
                console.log('   ✅ LIVREUR');
                console.log('   → Poste ses propres annonces');
                console.log('   → Son nom est utilisé automatiquement');
            }
            console.log('');
        });

        console.log('═══════════════════════════════════════════\n');
        console.log('✅ RÔLES CORRIGÉS AVEC SUCCÈS!\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

correctRoles()
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
