const { Pool } = require('pg');

// Using the same connection string that worked for verification
const connectionString = 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k?ssl=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function clearAds() {
    console.log("🔌 Connecting to database...");

    try {
        console.log("🗑️ Deleting all ads...");
        const result = await pool.query('DELETE FROM ads');

        console.log(`\n✅ Successfully deleted ${result.rowCount} ads from the database.`);

    } catch (err) {
        console.error("\n❌ Error clearing ads:", err.message);
    } finally {
        await pool.end();
    }
}

clearAds();
