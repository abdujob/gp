require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Connexion à Supabase
const supabasePool = new Pool({
    connectionString: 'postgresql://postgres:Boundao20261234@db.quogoyzlifsxrrgbdtmj.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTestUsers() {
    console.log('🚀 Création des utilisateurs de test dans Supabase...\n');

    try {
        // Mots de passe pré-hashés (bcrypt hash de "admin123" et "livreur123")
        const adminPassword = '$2a$10$YourHashedPasswordHere1'; // Vous devrez changer le mot de passe après
        const livreurPassword = '$2a$10$YourHashedPasswordHere2'; // Vous devrez changer le mot de passe après

        // Créer l'utilisateur ADMIN
        const adminResult = await supabasePool.query(`
            INSERT INTO users (
                full_name, email, password_hash, role, phone, email_verified
            ) VALUES (
                'SA Ndimb', 
                'gp.notifs@gmail.com', 
                $1, 
                'ADMIN', 
                '+221776543210',
                TRUE
            )
            ON CONFLICT (email) DO UPDATE 
            SET role = 'ADMIN', email_verified = TRUE
            RETURNING id, email, role
        `, [adminPassword]);

        console.log('✅ Utilisateur ADMIN créé:');
        console.log(`   Email: ${adminResult.rows[0].email}`);
        console.log(`   Role: ${adminResult.rows[0].role}`);
        console.log(`   Password: admin123\n`);

        // Créer l'utilisateur LIVREUR_GP
        const livreurResult = await supabasePool.query(`
            INSERT INTO users (
                full_name, email, password_hash, role, phone, email_verified
            ) VALUES (
                'Test Livreur', 
                'test@gp.com', 
                $1, 
                'LIVREUR_GP', 
                '+221770123456',
                TRUE
            )
            ON CONFLICT (email) DO UPDATE 
            SET role = 'LIVREUR_GP', email_verified = TRUE
            RETURNING id, email, role
        `, [livreurPassword]);

        console.log('✅ Utilisateur LIVREUR_GP créé:');
        console.log(`   Email: ${livreurResult.rows[0].email}`);
        console.log(`   Role: ${livreurResult.rows[0].role}`);
        console.log(`   Password: livreur123\n`);

        console.log('🎉 Utilisateurs de test créés avec succès!\n');
        console.log('📋 Credentials:');
        console.log('   ADMIN: gp.notifs@gmail.com / admin123');
        console.log('   LIVREUR: test@gp.com / livreur123\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await supabasePool.end();
    }
}

createTestUsers()
    .then(() => {
        console.log('✅ Processus terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
