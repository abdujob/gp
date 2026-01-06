require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initDB() {
    try {
        await client.connect();
        console.log('✅ Connected to database');

        const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await client.query(schema);
        console.log('✅ Schema executing successfully');

        console.log('Tables created!');
    } catch (err) {
        console.error('❌ Error initializing database:', err);
    } finally {
        await client.end();
    }
}

initDB();
