const { Pool } = require('pg');

// URL from DEPLOIEMENT_STATUS.md - Assuming this is the Render DB
// Note: This hostname usually only works within Render network.
// If this fails, we need the External connection string.
// Trying to guess external: dpg-...-a.oregon-postgres.render.com
const connectionString = 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k?ssl=true';

// Fallback: Use the exact string from the file if external hostname guess is wrong, 
// but local execution requires external hostname.
// Let's print both.

console.log("Connecting to Render DB...");

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);

        console.log("\nColumns in 'users' table:");
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

        // Check for required fields for register
        const required = ['full_name', 'email', 'password_hash', 'role', 'phone', 'address', 'provider', 'is_email_verified', 'email_verification_token', 'email_verification_expiry'];
        const existing = res.rows.map(r => r.column_name);

        const missing = required.filter(field => !existing.includes(field));

        if (missing.length > 0) {
            console.log("\n❌ MISSING COLUMNS:", missing.join(', '));
        } else {
            console.log("\n✅ All required columns present.");
        }

    } catch (err) {
        console.error("Connection error:", err.message);
        console.log("Hint: If address not found, the DB URL might be internal-only.");
    } finally {
        await pool.end();
    }
}

checkSchema();
