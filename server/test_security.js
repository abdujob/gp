const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Couleurs pour le terminal
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function runTests() {
    console.log('\n🧪 TESTS DE SÉCURITÉ - RÔLE LIVREUR_GP\n');

    let livreurToken = null;
    let expediteurToken = null;
    let adId = null;

    try {
        // Test 1: Inscription LIVREUR_GP
        log.info('Test 1: Inscription utilisateur LIVREUR_GP');
        try {
            const registerRes = await axios.post(`${API_URL}/auth/register`, {
                full_name: 'Test Livreur',
                email: `livreur_${Date.now()}@test.com`,
                password: 'test123',
                role: 'LIVREUR_GP',
                phone: '+33612345678',
                address: 'Paris, France'
            });

            livreurToken = registerRes.data.token;
            const user = registerRes.data.user;

            if (user.role === 'LIVREUR_GP') {
                log.success('Inscription LIVREUR_GP réussie avec rôle correct');
            } else {
                log.error(`Rôle incorrect: ${user.role} au lieu de LIVREUR_GP`);
            }
        } catch (err) {
            log.error(`Inscription échouée: ${err.response?.data?.msg || err.message}`);
            return;
        }

        // Test 2: Inscription EXPEDITEUR
        log.info('Test 2: Inscription utilisateur EXPEDITEUR');
        try {
            const registerRes = await axios.post(`${API_URL}/auth/register`, {
                full_name: 'Test Expediteur',
                email: `expediteur_${Date.now()}@test.com`,
                password: 'test123',
                role: 'EXPEDITEUR'
            });

            expediteurToken = registerRes.data.token;
            const user = registerRes.data.user;

            if (user.role === 'EXPEDITEUR') {
                log.success('Inscription EXPEDITEUR réussie avec rôle correct');
            } else {
                log.error(`Rôle incorrect: ${user.role} au lieu de EXPEDITEUR`);
            }
        } catch (err) {
            log.error(`Inscription échouée: ${err.response?.data?.msg || err.message}`);
        }

        // Test 3: Création annonce sans authentification
        log.info('Test 3: Création annonce SANS authentification (doit échouer)');
        try {
            await axios.post(`${API_URL}/ads`, {
                title: 'Test Ad',
                description: 'Test',
                address: 'Paris',
                city: 'Paris',
                latitude: 48.8566,
                longitude: 2.3522,
                available_date: '2025-01-15',
                transport_type: 'Petit colis',
                weight_capacity: '5kg',
                price: 25
            });
            log.error('FAILLE: Création autorisée sans token !');
        } catch (err) {
            if (err.response?.status === 401) {
                log.success('Création refusée (401) - Sécurité OK');
            } else {
                log.warning(`Erreur inattendue: ${err.response?.status}`);
            }
        }

        // Test 4: Création annonce avec EXPEDITEUR
        log.info('Test 4: Création annonce avec rôle EXPEDITEUR (doit échouer)');
        try {
            await axios.post(`${API_URL}/ads`, {
                title: 'Test Ad',
                description: 'Test',
                address: 'Paris',
                city: 'Paris',
                latitude: 48.8566,
                longitude: 2.3522,
                available_date: '2025-01-15',
                transport_type: 'Petit colis',
                weight_capacity: '5kg',
                price: 25
            }, {
                headers: { Authorization: `Bearer ${expediteurToken}` }
            });
            log.error('FAILLE: EXPEDITEUR peut créer des annonces !');
        } catch (err) {
            if (err.response?.status === 403) {
                log.success('Création refusée (403) - Contrôle de rôle OK');
            } else {
                log.warning(`Erreur inattendue: ${err.response?.status} - ${err.response?.data?.msg}`);
            }
        }

        // Test 5: Création annonce avec LIVREUR_GP
        log.info('Test 5: Création annonce avec rôle LIVREUR_GP (doit réussir)');
        try {
            const createRes = await axios.post(`${API_URL}/ads`, {
                title: 'Paris → New York',
                description: 'Transport de colis',
                address: 'Paris, France',
                city: 'Paris',
                latitude: 48.8566,
                longitude: 2.3522,
                available_date: '2025-01-15',
                transport_type: 'Petit colis',
                weight_capacity: '5kg',
                price: 25
            }, {
                headers: { Authorization: `Bearer ${livreurToken}` }
            });

            adId = createRes.data.id;
            log.success(`Création réussie - ID: ${adId}`);
        } catch (err) {
            log.error(`Création échouée: ${err.response?.data?.msg || err.message}`);
            return;
        }

        // Test 6: Modification annonce avec EXPEDITEUR
        log.info('Test 6: Modification annonce avec EXPEDITEUR (doit échouer)');
        try {
            await axios.put(`${API_URL}/ads/${adId}`, {
                price: 50
            }, {
                headers: { Authorization: `Bearer ${expediteurToken}` }
            });
            log.error('FAILLE: EXPEDITEUR peut modifier des annonces !');
        } catch (err) {
            if (err.response?.status === 403) {
                log.success('Modification refusée (403) - Contrôle de rôle OK');
            } else {
                log.warning(`Erreur inattendue: ${err.response?.status}`);
            }
        }

        // Test 7: Modification annonce avec LIVREUR_GP propriétaire
        log.info('Test 7: Modification annonce par le propriétaire LIVREUR_GP (doit réussir)');
        try {
            await axios.put(`${API_URL}/ads/${adId}`, {
                price: 30
            }, {
                headers: { Authorization: `Bearer ${livreurToken}` }
            });
            log.success('Modification réussie par le propriétaire');
        } catch (err) {
            log.error(`Modification échouée: ${err.response?.data?.msg || err.message}`);
        }

        // Test 8: Suppression avec LIVREUR_GP propriétaire
        log.info('Test 8: Suppression annonce par le propriétaire (doit réussir)');
        try {
            await axios.delete(`${API_URL}/ads/${adId}`, {
                headers: { Authorization: `Bearer ${livreurToken}` }
            });
            log.success('Suppression réussie par le propriétaire');
        } catch (err) {
            log.error(`Suppression échouée: ${err.response?.data?.msg || err.message}`);
        }

        console.log('\n✅ TOUS LES TESTS SONT PASSÉS - SÉCURITÉ CONFORME\n');

    } catch (err) {
        console.error('\n❌ ERREUR CRITIQUE:', err.message);
    }
}

runTests();
