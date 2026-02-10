const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.quogoyzlifsxrrgbdtmj:NjOzcXkIUDUO9TPC@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('--- Inspecting Data (Clean) ---');
        const ads = await pool.query('SELECT id, title, departure_city, arrival_city, latitude, longitude, advertiser_name FROM ads ORDER BY created_at DESC');
        console.log(`Found ${ads.rows.length} ads:`);
        console.table(ads.rows);

        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
