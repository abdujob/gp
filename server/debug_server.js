const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function debugRegister() {
    console.log('\n🔍 Test de connexion au serveur...\n');

    try {
        // Test 1: Vérifier que le serveur répond
        console.log('1. Test de santé du serveur...');
        const healthCheck = await axios.get('http://localhost:5000');
        console.log('✅ Serveur accessible\n');
    } catch (err) {
        console.log('❌ Serveur non accessible:', err.message);
        return;
    }

    // Test 2: Essayer de créer un compte
    const credentials = {
        full_name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: 'Test123!',
        role: 'LIVREUR_GP',
        phone: '+33612345678',
        address: 'Paris'
    };

    console.log('2. Tentative de création de compte...');
    console.log('Payload:', JSON.stringify(credentials, null, 2));

    try {
        const res = await axios.post(`${API_URL}/auth/register`, credentials);
        console.log('\n✅ Succès!');
        console.log('Réponse:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.log('\n❌ Échec');
        console.log('Status:', err.response?.status);
        console.log('Message:', err.response?.data);
        console.log('Erreur complète:', err.message);
    }
}

debugRegister();
