require('dotenv').config({ path: '../.env' });
const pool = require('./index');

const cleanupRoles = async () => {
    try {
        console.log('Cleaning up all role inconsistencies...\n');

        // Update ALL lowercase roles to uppercase
        const updates = [
            { from: 'expediteur', to: 'EXPEDITEUR' },
            { from: 'livreur', to: 'LIVREUR_GP' },
            { from: 'user', to: 'EXPEDITEUR' }
        ];

        for (const { from, to } of updates) {
            const res = await pool.query(
                `UPDATE users SET role = $1 WHERE role = $2 RETURNING id`,
                [to, from]
            );
            if (res.rowCount > 0) {
                console.log(`✅ Updated ${res.rowCount} user(s) from '${from}' to '${to}'`);
            }
        }

        // Show final distribution
        const final = await pool.query("SELECT role, COUNT(*) FROM users GROUP BY role");
        console.log('\n📊 Final role distribution:');
        console.table(final.rows);

        console.log('\n✅ Cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

cleanupRoles();
