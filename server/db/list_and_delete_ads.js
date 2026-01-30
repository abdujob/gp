require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function listAndDeleteAds() {
    console.log('📋 Liste des annonces dans la base de données\n');

    try {
        // Lister toutes les annonces
        const result = await pool.query(`
            SELECT 
                a.id,
                a.title,
                a.departure_city,
                a.arrival_city,
                a.price,
                a.created_at,
                u.email as user_email,
                u.full_name as user_name
            FROM ads a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
        `);

        if (result.rows.length === 0) {
            console.log('❌ Aucune annonce trouvée dans la base de données\n');
            return;
        }

        console.log(`✅ ${result.rows.length} annonce(s) trouvée(s):\n`);

        result.rows.forEach((ad, index) => {
            console.log('═══════════════════════════════════════════');
            console.log(`📦 Annonce #${index + 1}`);
            console.log(`   ID: ${ad.id}`);
            console.log(`   Titre: ${ad.title}`);
            console.log(`   Trajet: ${ad.departure_city} → ${ad.arrival_city}`);
            console.log(`   Prix: ${ad.price} FCFA`);
            console.log(`   Créée par: ${ad.user_name} (${ad.user_email})`);
            console.log(`   Date: ${new Date(ad.created_at).toLocaleString('fr-FR')}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════\n');

        // Demander confirmation pour supprimer TOUTES les annonces
        console.log('⚠️  Pour supprimer TOUTES les annonces, modifiez ce script\n');
        console.log('Décommentez la section de suppression ci-dessous:\n');

        // DÉCOMMENTEZ CES LIGNES POUR SUPPRIMER TOUTES LES ANNONCES
        /*
        console.log('🗑️  Suppression de toutes les annonces...\n');
        
        const deleteResult = await pool.query('DELETE FROM ads');
        console.log(`✅ ${deleteResult.rowCount} annonce(s) supprimée(s)\n`);
        */

        // OU pour supprimer une annonce spécifique par ID:
        /*
        const adIdToDelete = 'METTRE_ID_ICI';
        const deleteResult = await pool.query('DELETE FROM ads WHERE id = $1', [adIdToDelete]);
        console.log(`✅ Annonce ${adIdToDelete} supprimée\n`);
        */

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

listAndDeleteAds()
    .then(() => {
        console.log('✅ Terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
