require('dotenv').config({ path: '../.env' });
const pool = require('./index');

const migrateRoles = async () => {
    try {
        console.log('Starting Role Migration...');

        // Update Schema Default
        await pool.query("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'EXPEDITEUR'");
        console.log('Updated Default Role to EXPEDITEUR');

        // Update Existing Users
        // livreur -> LIVREUR_GP
        await pool.query("UPDATE users SET role = 'LIVREUR_GP' WHERE role = 'livreur'");
        console.log('Migrated livreur -> LIVREUR_GP');

        // expediteur -> EXPEDITEUR
        await pool.query("UPDATE users SET role = 'EXPEDITEUR' WHERE role = 'expediteur'");
        console.log('Migrated expediteur -> EXPEDITEUR');

        // user -> EXPEDITEUR (legacy cleanup)
        await pool.query("UPDATE users SET role = 'EXPEDITEUR' WHERE role = 'user'");
        console.log('Migrated user -> EXPEDITEUR');

        console.log('Migration Completed Successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

migrateRoles();
