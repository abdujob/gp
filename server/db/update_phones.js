require('dotenv').config({ path: '../.env' });
const pool = require('./index');

async function updateAllPhones() {
    console.log('📱 Mise à jour de tous les numéros de téléphone...\n');

    const phone = '0605954092';

    try {
        // Mettre à jour tous les utilisateurs
        const result = await pool.query(
            'UPDATE users SET phone = $1 WHERE phone IS NULL OR phone = \'\'',
            [phone]
        );

        console.log(`✅ ${result.rowCount} utilisateurs mis à jour avec le numéro: ${phone}\n`);

        // Vérifier
        const check = await pool.query('SELECT COUNT(*) as total, COUNT(phone) as with_phone FROM users');
        console.log('📊 Statistiques:');
        console.log(`  Total utilisateurs: ${check.rows[0].total}`);
        console.log(`  Avec numéro: ${check.rows[0].with_phone}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Erreur:', err.message);
        process.exit(1);
    }
}

updateAllPhones();
