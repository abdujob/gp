require('dotenv').config();
const { Pool } = require('pg');

// Connexion à Supabase (direct connection, not pooler)
const supabasePool = new Pool({
    connectionString: 'postgresql://postgres:Boundao20261234@db.quogoyzlifsxrrgbdtmj.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function createSchema() {
    console.log('🚀 Création du schéma dans Supabase...\n');

    try {
        // Enable UUID extension
        await supabasePool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('✅ Extension UUID activée');

        // Create users table
        await supabasePool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                avatar_url VARCHAR(500),
                role VARCHAR(50) DEFAULT 'EXPEDITEUR',
                phone VARCHAR(20),
                address TEXT,
                email_verified BOOLEAN DEFAULT FALSE,
                verification_token VARCHAR(255),
                verification_token_expires TIMESTAMP,
                reset_token VARCHAR(255),
                reset_token_expires TIMESTAMP,
                failed_login_attempts INTEGER DEFAULT 0,
                account_locked_until TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table users créée');

        // Create ads table
        await supabasePool.query(`
            CREATE TABLE IF NOT EXISTS ads (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                departure_city VARCHAR(100) NOT NULL,
                arrival_city VARCHAR(100) NOT NULL,
                address TEXT NOT NULL,
                city VARCHAR(100),
                latitude DOUBLE PRECISION NOT NULL,
                longitude DOUBLE PRECISION NOT NULL,
                available_date DATE NOT NULL,
                transport_type TEXT NOT NULL,
                image_url VARCHAR(500),
                weight_capacity VARCHAR(50),
                price DECIMAL(10, 2),
                phone VARCHAR(20),
                advertiser_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table ads créée');

        // Create refresh_tokens table
        await supabasePool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table refresh_tokens créée');

        // Create password_resets table
        await supabasePool.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table password_resets créée');

        // Create indexes
        await supabasePool.query('CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id)');
        await supabasePool.query('CREATE INDEX IF NOT EXISTS idx_ads_available_date ON ads(available_date)');
        await supabasePool.query('CREATE INDEX IF NOT EXISTS idx_ads_departure_city ON ads(departure_city)');
        await supabasePool.query('CREATE INDEX IF NOT EXISTS idx_ads_arrival_city ON ads(arrival_city)');
        console.log('✅ Index créés');

        console.log('\n🎉 Schéma créé avec succès dans Supabase!\n');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await supabasePool.end();
    }
}

createSchema()
    .then(() => {
        console.log('✅ Processus terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
