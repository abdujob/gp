const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function debugRegister() {
    console.log('\n🔍 DEBUG: Test d\'inscription\n');

    try {
        const payload = {
            full_name: 'Debug User',
            email: `debug_${Date.now()}@test.com`,
            password: 'test123',
            role: 'LIVREUR_GP',  // Envoi en MAJUSCULES
            phone: '+33612345678',
            address: 'Paris'
        };

        console.log('📤 Payload envoyé:');
        console.log(JSON.stringify(payload, null, 2));

        const res = await axios.post(`${API_URL}/auth/register`, payload);

        console.log('\n📥 Réponse reçue:');
        console.log(JSON.stringify(res.data.user, null, 2));

        console.log('\n🔐 JWT Payload décodé:');
        const token = res.data.token;
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        console.log(JSON.stringify(decodedPayload, null, 2));

    } catch (err) {
        console.error('❌ Erreur:', err.response?.data || err.message);
    }
}

debugRegister();
