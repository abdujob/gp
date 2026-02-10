const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.quogoyzlifsxrrgbdtmj:NjOzcXkIUDUO9TPC@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('--- Checking available_date and CURRENT_DATE ---');
        const now = await pool.query('SELECT CURRENT_DATE as today');
        console.log(`Today is: ${now.rows[0].today.toISOString().split('T')[0]}`);

        const ads = await pool.query('SELECT id, title, available_date FROM ads ORDER BY available_date DESC');
        console.table(ads.rows);

        const activeAds = await pool.query('SELECT COUNT(*) FROM ads WHERE available_date >= CURRENT_DATE');
        console.log(`Active ads (available_date >= today): ${activeAds.rows[0].count}`);

        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
