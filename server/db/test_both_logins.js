require('dotenv').config();
const axios = require('axios');

async function testLogin() {
    console.log('🧪 Test de connexion API...\n');

    const tests = [
        {
            name: 'Compte Test (LIVREUR_GP)',
            email: 'test@gp.com',
            password: 'Test123456@'
        },
        {
            name: 'Compte Admin (ADMIN)',
            email: 'gp.notifs@gmail.com',
            password: 'Sandimb2026@'
        }
    ];

    for (const test of tests) {
        console.log(`\n📝 Test: ${test.name}`);
        console.log(`   Email: ${test.email}`);

        try {
            const response = await axios.post(
                'https://gp-backend-skwd.onrender.com/api/auth/login',
                {
                    email: test.email,
                    password: test.password
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 30000
                }
            );

            console.log(`   ✅ Succès! Status: ${response.status}`);
            console.log(`   👤 Utilisateur: ${response.data.user?.full_name}`);
            console.log(`   🎭 Rôle: ${response.data.user?.role}`);
            console.log(`   🔑 Token reçu: ${response.data.accessToken ? 'Oui' : 'Non'}`);

        } catch (error) {
            if (error.response) {
                console.log(`   ❌ Erreur ${error.response.status}`);
                console.log(`   Message: ${error.response.data?.msg || error.response.data}`);
                console.log(`   Code: ${error.response.data?.code || 'N/A'}`);
            } else if (error.request) {
                console.log(`   ❌ Pas de réponse du serveur`);
                console.log(`   ${error.message}`);
            } else {
                console.log(`   ❌ Erreur: ${error.message}`);
            }
        }
    }

    console.log('\n✅ Tests terminés!\n');
}

testLogin().catch(console.error);
