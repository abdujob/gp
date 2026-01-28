require('dotenv').config();
const axios = require('axios');

async function testNewAdmin() {
    console.log('🧪 Test du nouveau compte admin...\n');

    try {
        const response = await axios.post(
            'https://gp-backend-skwd.onrender.com/api/auth/login',
            {
                email: 'admin@gp.com',
                password: 'Admin123@'
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );

        console.log('✅ SUCCÈS! Connexion réussie!\n');
        console.log('═══════════════════════════════════════════');
        console.log('📋 RÉPONSE DE L\'API');
        console.log('═══════════════════════════════════════════');
        console.log(`   Status: ${response.status}`);
        console.log(`   👤 Nom: ${response.data.user?.full_name}`);
        console.log(`   📧 Email: ${response.data.user?.email}`);
        console.log(`   🎭 Rôle: ${response.data.user?.role}`);
        console.log(`   🔑 Token reçu: ${response.data.accessToken ? 'Oui' : 'Non'}`);
        console.log('═══════════════════════════════════════════\n');

    } catch (error) {
        if (error.response) {
            console.log('❌ ÉCHEC!\n');
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Message: ${error.response.data?.msg || error.response.data}`);
            console.log(`   Code: ${error.response.data?.code || 'N/A'}\n`);
        } else {
            console.log(`❌ Erreur: ${error.message}\n`);
        }
    }
}

testNewAdmin().catch(console.error);
