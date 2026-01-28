require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function createAdminUser() {
    console.log('🔧 Configuration du rôle ADMIN...\n');

    try {
        // Étape 1 : Vérifier et modifier la contrainte de rôle
        console.log('1️⃣ Vérification de la contrainte de rôle...');

        // Supprimer l'ancienne contrainte si elle existe
        await pool.query(`
            ALTER TABLE users 
            DROP CONSTRAINT IF EXISTS users_role_check
        `);

        // Ajouter une nouvelle contrainte incluant ADMIN
        await pool.query(`
            ALTER TABLE users 
            ADD CONSTRAINT users_role_check 
            CHECK (role IN ('EXPEDITEUR', 'LIVREUR_GP', 'ADMIN'))
        `);

        console.log('✅ Contrainte de rôle mise à jour (EXPEDITEUR, LIVREUR_GP, ADMIN)\n');

        // Étape 2 : Créer le compte admin
        console.log('2️⃣ Création du compte administrateur...');

        const full_name = 'SA Ndimb';
        const email = 'gp.notifs@gmail.com';
        const password = 'Sandimb2026@';
        const role = 'ADMIN';

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log('⚠️  Un utilisateur avec cet email existe déjà.');
            console.log('   Suppression de l\'ancien compte...\n');
            await pool.query('DELETE FROM users WHERE email = $1', [email]);
        }

        // Hasher le mot de passe
        const password_hash = await bcrypt.hash(password, 10);

        // Créer l'utilisateur admin
        const result = await pool.query(
            `INSERT INTO users (
                full_name, email, password_hash, role,
                provider, is_email_verified
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, full_name, email, role, created_at`,
            [full_name, email, password_hash, role, 'LOCAL', true]
        );

        const admin = result.rows[0];

        console.log('✅ Compte administrateur créé avec succès!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📋 INFORMATIONS DU COMPTE ADMIN');
        console.log('═══════════════════════════════════════════');
        console.log(`   👤 Nom: ${admin.full_name}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🔑 Mot de passe: Sandimb2026@`);
        console.log(`   🎭 Rôle: ${admin.role}`);
        console.log(`   🆔 ID: ${admin.id}`);
        console.log(`   📅 Créé le: ${admin.created_at}`);
        console.log('═══════════════════════════════════════════\n');

        // Vérifier le total d'utilisateurs
        const count = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`📊 Total d'utilisateurs dans la base: ${count.rows[0].count}\n`);

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

createAdminUser()
    .then(() => {
        console.log('✅ Opération terminée avec succès!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
