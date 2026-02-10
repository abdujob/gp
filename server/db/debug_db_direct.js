const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.quogoyzlifsxrrgbdtmj:NjOzcXkIUDUO9TPC@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('--- Inspecting Columns ---');
        const cols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ads'
        `);
        console.table(cols.rows);

        console.log('\n--- Inspecting Data (All ads) ---');
        const ads = await pool.query('SELECT id, title, departure_city, arrival_city, city, destination_city, advertiser_name, user_id FROM ads');
        console.table(ads.rows);

        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
