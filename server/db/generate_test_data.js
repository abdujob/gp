require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const bcrypt = require('bcrypt');
const pool = require('./index');

const API_URL = 'http://localhost:5000/api';

// Villes France
const villesFrance = [
    { nom: 'Paris', lat: 48.8566, lng: 2.3522 },
    { nom: 'Lyon', lat: 45.7640, lng: 4.8357 },
    { nom: 'Marseille', lat: 43.2965, lng: 5.3698 },
    { nom: 'Toulouse', lat: 43.6047, lng: 1.4442 },
    { nom: 'Nice', lat: 43.7102, lng: 7.2620 },
    { nom: 'Nantes', lat: 47.2184, lng: -1.5536 },
    { nom: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
    { nom: 'Lille', lat: 50.6292, lng: 3.0573 },
    { nom: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
    { nom: 'Montpellier', lat: 43.6108, lng: 3.8767 }
];

// Villes Sénégal
const villesSenegal = [
    { nom: 'Dakar', lat: 14.6928, lng: -17.4467 },
    { nom: 'Thiès', lat: 14.7886, lng: -16.9260 },
    { nom: 'Saint-Louis', lat: 16.0179, lng: -16.4897 },
    { nom: 'Kaolack', lat: 14.1500, lng: -16.0667 },
    { nom: 'Ziguinchor', lat: 12.5833, lng: -16.2667 },
    { nom: 'Touba', lat: 14.8500, lng: -15.8833 },
    { nom: 'Mbour', lat: 14.4167, lng: -16.9667 },
    { nom: 'Rufisque', lat: 14.7167, lng: -17.2667 }
];

// Prénoms et noms sénégalais/français
const prenoms = ['Amadou', 'Fatou', 'Moussa', 'Aïssatou', 'Ibrahima', 'Mariama', 'Ousmane', 'Khady', 'Mamadou', 'Awa',
    'Pierre', 'Marie', 'Jean', 'Sophie', 'Luc', 'Nathalie', 'Thomas', 'Julie', 'Nicolas', 'Céline'];
const noms = ['Diallo', 'Ndiaye', 'Sow', 'Diop', 'Fall', 'Ba', 'Sy', 'Sarr', 'Gueye', 'Cissé',
    'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau'];

const typesTransport = ['Petit colis', 'Documents', 'Achats', 'Bagages'];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

async function generateData() {
    console.log('🚀 Génération de 50 livreurs avec annonces France-Sénégal...\n');

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('Test123!', salt);

        let usersCreated = 0;
        let adsCreated = 0;

        for (let i = 1; i <= 50; i++) {
            const prenom = randomElement(prenoms);
            const nom = randomElement(noms);
            const fullName = `${prenom} ${nom}`;
            const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}@gp.com`;
            const phone = `+33 ${Math.floor(Math.random() * 9 + 1)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`;

            // Créer l'utilisateur
            const userResult = await pool.query(
                'INSERT INTO users (full_name, email, password_hash, role, phone, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [fullName, email, password_hash, 'LIVREUR_GP', phone, 'France/Sénégal']
            );

            const userId = userResult.rows[0].id;
            usersCreated++;

            // Créer 1 à 3 annonces par livreur
            const numAds = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < numAds; j++) {
                const isFranceToSenegal = Math.random() > 0.5;

                let villeDepart, villeArrivee, address, city, lat, lng;

                if (isFranceToSenegal) {
                    villeDepart = randomElement(villesFrance);
                    villeArrivee = randomElement(villesSenegal);
                    address = `${villeDepart.nom}, France`;
                    city = villeDepart.nom;
                    lat = villeDepart.lat;
                    lng = villeDepart.lng;
                } else {
                    villeDepart = randomElement(villesSenegal);
                    villeArrivee = randomElement(villesFrance);
                    address = `${villeDepart.nom}, Sénégal`;
                    city = villeDepart.nom;
                    lat = villeDepart.lat;
                    lng = villeDepart.lng;
                }

                const title = `${villeDepart.nom} → ${villeArrivee.nom}`;
                const description = `Je voyage de ${villeDepart.nom} à ${villeArrivee.nom} et je peux transporter vos colis en toute sécurité. Expérience de ${Math.floor(Math.random() * 10) + 1} ans dans le transport.`;

                const availableDate = formatDate(randomDate(new Date(), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)));
                const transportType = randomElement(typesTransport);
                const weightCapacity = `${Math.floor(Math.random() * 20) + 1} kg`;
                const price = Math.floor(Math.random() * 80) + 20;

                await pool.query(
                    `INSERT INTO ads (
                        user_id, title, description, address, city, 
                        latitude, longitude, available_date, transport_type, 
                        weight_capacity, price
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [userId, title, description, address, city, lat, lng, availableDate, transportType, weightCapacity, price]
                );

                adsCreated++;
            }

            if (i % 10 === 0) {
                console.log(`✅ ${i}/50 livreurs créés...`);
            }
        }

        console.log(`\n🎉 Génération terminée !`);
        console.log(`👥 ${usersCreated} livreurs créés`);
        console.log(`📦 ${adsCreated} annonces créées`);
        console.log(`\n📊 Statistiques:`);

        const stats = await pool.query(`
            SELECT 
                COUNT(DISTINCT user_id) as total_livreurs,
                COUNT(*) as total_annonces,
                AVG(price)::numeric(10,2) as prix_moyen
            FROM ads
        `);

        console.table(stats.rows);

        process.exit(0);

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

generateData();
