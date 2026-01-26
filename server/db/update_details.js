const { Pool } = require('pg');

const connectionString = 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k?ssl=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function updateDetails() {
    console.log("🔌 Connecting to database...");

    try {
        // 1. Update User Details (Name and Phone)
        // Find the user who owns the specific ad
        const adRes = await pool.query("SELECT user_id FROM ads WHERE title = 'Transport Marseille -> Dakar (8 Février)' LIMIT 1");

        if (adRes.rows.length > 0) {
            const userId = adRes.rows[0].user_id;
            console.log(`FOUND User ID: ${userId}`);

            await pool.query(`
                UPDATE users 
                SET full_name = 'Mme Dramé', 
                    phone = '0788246184' 
                WHERE id = $1
            `, [userId]);
            console.log("✅ User updated: Name -> Mme Dramé, Phone -> 0788246184");
        } else {
            console.log("⚠️ Could not find the ad to identify the user.");
        }

        // 2. Update Ad Description
        const newDescription = "Marseille dakar le 8 fevrier numero etelephone pour le whatsap:0788246184 (+33788246184)";
        const updateAdRes = await pool.query(`
            UPDATE ads 
            SET description = $1 
            WHERE title = 'Transport Marseille -> Dakar (8 Février)'
            RETURNING id
        `, [newDescription]);

        if (updateAdRes.rowCount > 0) {
            console.log(`✅ Ad updated: Description updated successfully.`);
        } else {
            console.log("⚠️ No ad found to update.");
        }

    } catch (err) {
        console.error("\n❌ Error updating details:", err.message);
    } finally {
        await pool.end();
    }
}

updateDetails();
