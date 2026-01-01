require('dotenv').config({ path: '../.env' });
const pool = require('./index');

const fixDefault = async () => {
    try {
        console.log('Fixing default role in schema...');

        // Update the default value for the role column
        await pool.query("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'EXPEDITEUR'");
        console.log('✅ Default role updated to EXPEDITEUR');

        // Show current role distribution
        const res = await pool.query("SELECT role, COUNT(*) FROM users GROUP BY role");
        console.log('\nCurrent role distribution:');
        console.table(res.rows);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

fixDefault();
