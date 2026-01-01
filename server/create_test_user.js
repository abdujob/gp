const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createTestUser() {
    console.log('\n🔧 Création d\'un utilisateur LIVREUR_GP de test...\n');

    const credentials = {
        full_name: 'Jean Dupont',
        email: 'livreur.test@gp.com',
        password: 'Test123!',
        role: 'LIVREUR_GP',
        phone: '+33 6 12 34 56 78',
        address: '15 Rue de la Paix, 75002 Paris, France'
    };

    try {
        // Vérifier si l'utilisateur existe déjà
        try {
            const loginTest = await axios.post(`${API_URL}/auth/login`, {
                email: credentials.email,
                password: credentials.password
            });

            console.log('✅ Utilisateur déjà existant - Connexion réussie\n');
            console.log('📋 IDENTIFIANTS DE CONNEXION:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`Email:    ${credentials.email}`);
            console.log(`Password: ${credentials.password}`);
            console.log(`Rôle:     ${loginTest.data.user.role}`);
            console.log(`Nom:      ${loginTest.data.user.full_name}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            console.log('🔑 Token JWT (pour tests API):');
            console.log(loginTest.data.token);
            console.log('\n');

            return;
        } catch (err) {
            // L'utilisateur n'existe pas, on le crée
        }

        // Créer le nouvel utilisateur
        const response = await axios.post(`${API_URL}/auth/register`, credentials);

        console.log('✅ Utilisateur créé avec succès!\n');
        console.log('📋 IDENTIFIANTS DE CONNEXION:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${credentials.email}`);
        console.log(`Password: ${credentials.password}`);
        console.log(`Rôle:     ${response.data.user.role}`);
        console.log(`Nom:      ${response.data.user.full_name}`);
        console.log(`Téléphone: ${credentials.phone}`);
        console.log(`Adresse:  ${credentials.address}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🔑 Token JWT (pour tests API):');
        console.log(response.data.token);
        console.log('\n');

        console.log('💡 Instructions:');
        console.log('1. Allez sur http://localhost:3000/login');
        console.log('2. Utilisez les identifiants ci-dessus');
        console.log('3. Vous aurez accès au dashboard LIVREUR_GP');
        console.log('4. Vous pourrez créer/modifier/supprimer des annonces\n');

    } catch (err) {
        console.error('❌ Erreur:', err.response?.data || err.message);
    }
}

createTestUser();
