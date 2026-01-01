const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createNewTestUser() {
    console.log('\n🔧 Création d\'un nouveau compte LIVREUR_GP...\n');

    const timestamp = Date.now();
    const credentials = {
        full_name: 'Marie Martin',
        email: `marie.martin.${timestamp}@gp.com`,
        password: 'Test123!',
        role: 'LIVREUR_GP',
        phone: '+33 7 89 01 23 45',
        address: '25 Avenue des Champs-Élysées, 75008 Paris, France'
    };

    try {
        const response = await axios.post(`${API_URL}/auth/register`, credentials);

        console.log('✅ Compte créé avec succès!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 IDENTIFIANTS DE CONNEXION:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:    ${credentials.email}`);
        console.log(`Password: ${credentials.password}`);
        console.log(`Rôle:     ${response.data.user.role}`);
        console.log(`Nom:      ${response.data.user.full_name}`);
        console.log(`Téléphone: ${credentials.phone}`);
        console.log(`Adresse:  ${credentials.address}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('💡 Pour tester:');
        console.log('1. Allez sur http://localhost:3000/login');
        console.log(`2. Email: ${credentials.email}`);
        console.log(`3. Password: ${credentials.password}\n`);

    } catch (err) {
        console.error('❌ Erreur:', err.response?.data || err.message);
        console.error('\nDétails:', err.response?.data);
    }
}

createNewTestUser();
