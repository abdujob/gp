const { Pool } = require('pg');

// Using the same connection string that worked for verification
const connectionString = 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k?ssl=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function fixSchema() {
    console.log("🔌 Connecting to database...");

    try {
        // 1. Add email_verification_token
        console.log("Adding email_verification_token...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
        `);

        // 2. Add email_verification_expiry
        console.log("Adding email_verification_expiry...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email_verification_expiry TIMESTAMP;
        `);

        // 3. Add password_reset_token (Just in case)
        console.log("Adding password_reset_token...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
        `);

        // 4. Add password_reset_expiry (Just in case)
        console.log("Adding password_reset_expiry...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMP;
        `);

        console.log("\n✅ Schema update complete! Missing columns added.");

    } catch (err) {
        console.error("\n❌ Error updating schema:", err.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
