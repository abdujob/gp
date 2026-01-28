const { Pool } = require('pg');

const connectionString = 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k?ssl=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function updateAd() {
    console.log("🔌 Connecting to database...");

    try {
        const newDescription = "Marseille dakar le 8 fevrier numero etelephone pour le whatsap:0788246184 (+33788246184)";

        // Update the most recent ad with the matching title prefix or just the last created one
        const res = await pool.query(`
            UPDATE ads 
            SET description = $1 
            WHERE title = 'Transport Marseille -> Dakar (8 Février)'
            RETURNING id, description;
        `, [newDescription]);

        if (res.rowCount > 0) {
            console.log(`\n✅ Ad updated successfully! \nID: ${res.rows[0].id} \nNew Desc: ${res.rows[0].description}`);
        } else {
            console.log("⚠️ No matching ad found to update.");
        }

    } catch (err) {
        console.error("\n❌ Error updating ad:", err.message);
    } finally {
        await pool.end();
    }
}

updateAd();
