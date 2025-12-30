require('dotenv').config({ path: '../.env' });
const pool = require('./index');

const verifyRoles = async () => {
    try {
        console.log('Verifying Roles...');

        const res = await pool.query("SELECT role, COUNT(*) FROM users GROUP BY role");
        console.table(res.rows);

        process.exit(0);
    } catch (err) {
        console.error('Verification Failed:', err);
        process.exit(1);
    }
};

verifyRoles();
