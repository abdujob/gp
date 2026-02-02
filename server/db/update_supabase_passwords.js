const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Connexion à Supabase
const pool = new Pool({
    connectionString: 'postgresql://postgres:Boundao20261234@db.quogoyzlifsxrrgbdtmj.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function updatePasswords() {
    console.log('🔐 Mise à jour des mots de passe...\n');

    try {
        // Hash des vrais mots de passe
        const adminHash = await bcrypt.hash('admin123', 10);
        const livreurHash = await bcrypt.hash('livreur123', 10);

        console.log('✅ Mots de passe hashés');

        // Mettre à jour l'admin
        await pool.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE email = 'gp.notifs@gmail.com'
        `, [adminHash]);
        console.log('✅ Mot de passe ADMIN mis à jour');

        // Mettre à jour le livreur
        await pool.query(`
            UPDATE users 
            SET password_hash = $1 
            WHERE email = 'test@gp.com'
        `, [livreurHash]);
        console.log('✅ Mot de passe LIVREUR mis à jour');

        console.log('\n🎉 Mots de passe mis à jour avec succès!');
        console.log('\n📋 Credentials:');
        console.log('   ADMIN: gp.notifs@gmail.com / admin123');
        console.log('   LIVREUR: test@gp.com / livreur123\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

updatePasswords()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
