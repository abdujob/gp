// Script pour ajouter des annonces de test dans RDS PostgreSQL
const { Client } = require('pg');

const client = new Client({
    host: 'gp-database.catim6ga667r.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'gp_admin',
    password: 'GpSecurePass2026!',
    database: 'gp_db',
    ssl: {
        rejectUnauthorized: false
    }
});

async function addTestData() {
    try {
        console.log('🔌 Connexion à RDS PostgreSQL...');
        await client.connect();
        console.log('✅ Connecté !');

        // Créer un utilisateur test (LIVREUR_GP)
        console.log('\n📝 Création d\'un utilisateur test...');
        const userResult = await client.query(`
      INSERT INTO users (full_name, email, password_hash, role, phone, address, is_email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING id, full_name, email
    `, [
            'Livreur Test',
            'livreur@test.com',
            '$2b$10$abcdefghijklmnopqrstuv', // Hash fictif
            'LIVREUR_GP',
            '+221 77 123 45 67',
            'Dakar, Sénégal',
            true
        ]);

        const userId = userResult.rows[0].id;
        console.log(`✅ Utilisateur créé : ${userResult.rows[0].full_name} (${userResult.rows[0].email})`);

        // Créer des annonces de test
        console.log('\n📦 Création d\'annonces de test...');

        const ads = [
            {
                title: 'Livraison Dakar → Paris',
                description: 'Je voyage de Dakar à Paris le 15 janvier. Je peux transporter des colis jusqu\'à 20kg. Documents et petits colis acceptés.',
                address: 'Dakar, Sénégal',
                city: 'Dakar',
                latitude: 14.6928,
                longitude: -17.4467,
                available_date: '2026-01-15',
                transport_type: 'colis',
                weight_capacity: '20 kg',
                price: 50.00
            },
            {
                title: 'Transport Documents Dakar → Lyon',
                description: 'Voyage prévu pour le 20 janvier. Spécialisé dans le transport de documents importants. Service rapide et sécurisé.',
                address: 'Plateau, Dakar',
                city: 'Dakar',
                latitude: 14.6937,
                longitude: -17.4441,
                available_date: '2026-01-20',
                transport_type: 'document',
                weight_capacity: '5 kg',
                price: 30.00
            },
            {
                title: 'Colis Dakar → Marseille',
                description: 'Départ le 25 janvier. Je peux prendre des colis jusqu\'à 15kg. Livraison rapide garantie.',
                address: 'Almadies, Dakar',
                city: 'Dakar',
                latitude: 14.7392,
                longitude: -17.5003,
                available_date: '2026-01-25',
                transport_type: 'colis',
                weight_capacity: '15 kg',
                price: 45.00
            },
            {
                title: 'Livraison Express Dakar → Toulouse',
                description: 'Service express disponible dès le 10 janvier. Idéal pour documents urgents et petits colis.',
                address: 'Mermoz, Dakar',
                city: 'Dakar',
                latitude: 14.7167,
                longitude: -17.4667,
                available_date: '2026-01-10',
                transport_type: 'autre',
                weight_capacity: '10 kg',
                price: 40.00
            },
            {
                title: 'Transport Colis Dakar → Bordeaux',
                description: 'Voyage régulier vers Bordeaux. Disponible le 18 janvier. Colis et documents acceptés.',
                address: 'Ouakam, Dakar',
                city: 'Dakar',
                latitude: 14.7197,
                longitude: -17.4903,
                available_date: '2026-01-18',
                transport_type: 'colis',
                weight_capacity: '25 kg',
                price: 55.00
            }
        ];

        for (const ad of ads) {
            const result = await client.query(`
        INSERT INTO ads (
          user_id, title, description, address, city, 
          latitude, longitude, available_date, transport_type,
          weight_capacity, price
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, title
      `, [
                userId,
                ad.title,
                ad.description,
                ad.address,
                ad.city,
                ad.latitude,
                ad.longitude,
                ad.available_date,
                ad.transport_type,
                ad.weight_capacity,
                ad.price
            ]);

            console.log(`  ✅ ${result.rows[0].title}`);
        }

        // Vérifier le total
        const countResult = await client.query('SELECT COUNT(*) FROM ads');
        console.log(`\n🎉 Total d'annonces dans la base : ${countResult.rows[0].count}`);

        console.log('\n✅ Données de test ajoutées avec succès !');
        console.log('\n🌐 Testez maintenant votre application :');
        console.log('   Frontend : https://d2caxflzc9bgu5.amplifyapp.com');
        console.log('   Backend : http://gp-backend-env.eba-tyycdbie.us-east-1.elasticbeanstalk.com/api/ads');

    } catch (error) {
        console.error('❌ Erreur :', error.message);
        console.error(error);
    } finally {
        await client.end();
        console.log('\n🔌 Connexion fermée.');
    }
}

addTestData();
