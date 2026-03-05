const { Pool } = require('pg');
require('dotenv').config();

// --- PRODUCTION ---
// Utilise DATABASE_URL (Supabase / Render) — voir server/.env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false
});

// --- LOCAL (Docker) ---
// Pour lancer en local : commente le bloc "pool" ci-dessus
// et décommente le bloc ci-dessous
// const pool = new Pool({
//   host: 'localhost',
//   port: 5432,
//   user: 'admin',
//   password: 'password123',
//   database: 'sendvoyage',
//   ssl: false
// });

module.exports = {
  query: (text, params) => pool.query(text, params),
};
