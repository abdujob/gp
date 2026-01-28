require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

async function testAdCreation() {
    console.log('🧪 Test de création d\'annonce...\n');

    // Simuler les données exactes du frontend
    const formData = new FormData();
    formData.append('title', 'Test - Voyage Dakar Paris');
    formData.append('description', 'Je voyage de Dakar à Paris le 15 février. Je peux transporter des colis jusqu\'à 5kg.');
    formData.append('address', 'Dakar, Sénégal');
    formData.append('city', 'Dakar');
    formData.append('latitude', '14.6937');
    formData.append('longitude', '-17.4441');
    formData.append('available_date', '2026-02-15');
    formData.append('transport_type', 'colis');
    formData.append('weight_capacity', '5kg');
    formData.append('price', '5000');
    formData.append('phone', '+221 77 123 45 67');

    try {
        // Vous devez remplacer ce token par un vrai token d'authentification
        const token = 'VOTRE_TOKEN_ICI'; // À obtenir après connexion

        const response = await axios.post(
            'https://gp-backend-skwd.onrender.com/api/ads',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${token}`
                },
                timeout: 30000
            }
        );

        console.log('✅ SUCCÈS!\n');
        console.log('Status:', response.status);
        console.log('Annonce créée:', response.data);

    } catch (error) {
        if (error.response) {
            console.log('❌ ERREUR!\n');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data);

            if (error.response.data.errors) {
                console.log('\n📋 Erreurs de validation:');
                error.response.data.errors.forEach((err, index) => {
                    console.log(`   ${index + 1}. ${err.param}: ${err.msg}`);
                });
            }
        } else {
            console.log('❌ Erreur:', error.message);
        }
    }
}

console.log('⚠️  IMPORTANT: Ce script nécessite un token d\'authentification valide.');
console.log('   Pour obtenir un token:');
console.log('   1. Connectez-vous sur le site');
console.log('   2. Ouvrez la console du navigateur (F12)');
console.log('   3. Allez dans Application > Local Storage');
console.log('   4. Cherchez "accessToken"');
console.log('   5. Copiez la valeur et remplacez VOTRE_TOKEN_ICI dans ce script\n');

// testAdCreation().catch(console.error);
console.log('Script prêt. Décommentez la dernière ligne après avoir ajouté le token.\n');
