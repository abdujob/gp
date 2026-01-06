require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://gp_db_6f6k_user:1zEhZ9QVqTdymIXhlS5VmeCpLXMjEoPk@dpg-d5bbji1r0fns738rhc20-a.oregon-postgres.render.com/gp_db_6f6k',
    ssl: { rejectUnauthorized: false }
});

/**
 * Extrait la ville de destination depuis le titre de l'annonce
 * Format attendu: "Ville1 → Ville2" ou "Ville1 - Ville2"
 */
function extractDestination(title) {
    // Essayer avec →
    let parts = title.split('→').map(s => s.trim());
    if (parts.length === 2) {
        return parts[1];
    }

    // Essayer avec -
    parts = title.split('-').map(s => s.trim());
    if (parts.length === 2) {
        return parts[1];
    }

    return null;
}

/**
 * Geocode une ville via Nominatim
 */
async function geocodeCity(cityName) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'GP-Platform/1.0' }
        });
        const data = await response.json();

        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (err) {
        console.error(`Erreur geocoding ${cityName}:`, err.message);
    }
    return null;
}

async function updateDestinations() {
    console.log('🔄 Mise à jour des destinations des annonces existantes...\n');

    try {
        // Récupérer toutes les annonces
        const ads = await pool.query('SELECT id, title FROM ads WHERE destination_city IS NULL');

        console.log(`📦 ${ads.rows.length} annonces à traiter\n`);

        let updated = 0;
        let failed = 0;

        for (const ad of ads.rows) {
            const destination = extractDestination(ad.title);

            if (destination) {
                console.log(`Processing: ${ad.title} → Destination: ${destination}`);

                // Geocoder la destination
                const coords = await geocodeCity(destination);

                if (coords) {
                    await pool.query(
                        'UPDATE ads SET destination_city = $1, destination_lat = $2, destination_lng = $3 WHERE id = $4',
                        [destination, coords.lat, coords.lng, ad.id]
                    );
                    updated++;
                    console.log(`  ✅ Mis à jour: ${destination} (${coords.lat}, ${coords.lng})`);
                } else {
                    failed++;
                    console.log(`  ⚠️  Geocoding échoué pour: ${destination}`);
                }

                // Pause pour respecter les limites de l'API
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                failed++;
                console.log(`  ❌ Impossible d'extraire destination de: ${ad.title}`);
            }
        }

        console.log(`\n📊 Résultats:`);
        console.log(`  ✅ Mises à jour réussies: ${updated}`);
        console.log(`  ❌ Échecs: ${failed}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

updateDestinations();
