const pool = require('./db');

async function checkAdvertiserNames() {
    try {
        const result = await pool.query(`
            SELECT 
                ads.id,
                ads.title,
                ads.advertiser_name,
                ads.user_id,
                users.full_name as user_full_name,
                users.role,
                COALESCE(ads.advertiser_name, users.full_name) as displayed_name
            FROM ads
            JOIN users ON ads.user_id = users.id
            ORDER BY ads.created_at DESC
            LIMIT 10
        `);

        console.log('\n=== Annonces récentes ===\n');
        result.rows.forEach(ad => {
            console.log(`ID: ${ad.id}`);
            console.log(`Titre: ${ad.title}`);
            console.log(`Créé par (role): ${ad.role}`);
            console.log(`Nom utilisateur: ${ad.user_full_name}`);
            console.log(`Nom livreur (advertiser_name): ${ad.advertiser_name || 'NULL'}`);
            console.log(`Nom affiché: ${ad.displayed_name}`);
            console.log('---\n');
        });

        await pool.end();
    } catch (err) {
        console.error('Erreur:', err.message);
        process.exit(1);
    }
}

checkAdvertiserNames();
