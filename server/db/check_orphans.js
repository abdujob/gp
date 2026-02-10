const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.quogoyzlifsxrrgbdtmj:NjOzcXkIUDUO9TPC@aws-1-eu-west-3.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('--- Checking Ads and Users Linkage ---');

        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        console.log(`Total users: ${userCount.rows[0].count}`);

        const adCount = await pool.query('SELECT COUNT(*) FROM ads');
        console.log(`Total ads: ${adCount.rows[0].count}`);

        const orphanAds = await pool.query(`
            SELECT COUNT(*) FROM ads 
            LEFT JOIN users ON ads.user_id = users.id 
            WHERE users.id IS NULL
        `);
        console.log(`Orphan ads (no matching user): ${orphanAds.rows[0].count}`);

        const adsWithUsers = await pool.query(`
            SELECT ads.id, ads.title, users.full_name as owner 
            FROM ads 
            JOIN users ON ads.user_id = users.id 
            LIMIT 5
        `);
        console.log('\nSample ads with owners:');
        console.table(adsWithUsers.rows);

        await pool.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
