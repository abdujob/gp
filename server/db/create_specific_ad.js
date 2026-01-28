const { Pool } = require('pg');

// Using the same connection string
const connectionString = 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k?ssl=true';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function createAd() {
    console.log("🔌 Connecting to database...");

    try {
        // 1. Get or Create User
        let user_id;
        const userRes = await pool.query('SELECT id FROM users LIMIT 1');

        if (userRes.rows.length > 0) {
            user_id = userRes.rows[0].id;
            console.log("✅ Found existing user:", user_id);
        } else {
            console.log("⚠️ No users found. Creating test user...");
            const newUser = await pool.query(`
                INSERT INTO users (full_name, email, password_hash, role, phone, address, provider, is_email_verified)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, ['Test User', 'test@example.com', 'hash_placeholder', 'LIVREUR_GP', '0788246184', 'Marseille', 'LOCAL', true]);
            user_id = newUser.rows[0].id;
            console.log("✅ Created new user:", user_id);
        }

        // 2. Insert Ad
        console.log("📝 Creating Ad...");
        const adValues = [
            user_id,
            'Transport Marseille -> Dakar (8 Février)',
            'Marseille dakar le 8 fevrier numero etelephone pour le whatsap:0788246184',
            'Marseille, France',
            'Marseille',
            43.2965, // Lat
            5.3698,  // Lng
            '2026-02-08',
            'colis',
            'https://gp-uploads-2026.s3.amazonaws.com/default-luggage.jpg', // Placeholder or null
            '23 kg',
            10.00
        ];

        const adRes = await pool.query(`
            INSERT INTO ads (
                user_id, title, description, address, city, 
                latitude, longitude, available_date, transport_type, 
                image_url, weight_capacity, price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id;
        `, adValues);

        console.log(`\n✅ Ad created successfully! ID: ${adRes.rows[0].id}`);

    } catch (err) {
        console.error("\n❌ Error creating ad:", err.message);
    } finally {
        await pool.end();
    }
}

createAd();
