const pool = require('./index');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function inspectTable() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ads'
        `);
        console.log('=== STRUCTURE DE LA TABLE ADS ===');
        console.table(res.rows);

        const countRes = await pool.query('SELECT COUNT(*) FROM ads');
        console.log(`\nNombre total d'annonces : ${countRes.rows[0].count}`);

        if (countRes.rows[0].count > 0) {
            const sampleRes = await pool.query('SELECT * FROM ads LIMIT 1');
            console.log('\nExemple de données (première ligne) :');
            console.log(sampleRes.rows[0]);
        }

        await pool.end();
    } catch (err) {
        console.error('Erreur d\'inspection :', err);
        process.exit(1);
    }
}

inspectTable();
