require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false
});

async function listBackups() {
    const backupDir = path.join(__dirname, 'backups');

    if (!fs.existsSync(backupDir)) {
        console.log('❌ Aucune sauvegarde trouvée.');
        return [];
    }

    const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse();

    return files;
}

async function restoreDatabase(backupFile) {
    console.log(`🔄 Restauration depuis: ${backupFile}\n`);

    try {
        const backupPath = path.join(__dirname, 'backups', backupFile);
        const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

        console.log(`📅 Sauvegarde du: ${backupData.timestamp}`);
        console.log(`📊 Tables à restaurer: ${Object.keys(backupData.tables).join(', ')}\n`);

        // Désactiver les contraintes temporairement
        await pool.query('SET session_replication_role = replica;');

        for (const [tableName, rows] of Object.entries(backupData.tables)) {
            console.log(`📦 Restauration de "${tableName}"...`);

            // Vider la table
            await pool.query(`TRUNCATE TABLE ${tableName} CASCADE`);
            console.log(`   🗑️  Table vidée`);

            if (rows.length === 0) {
                console.log(`   ⚠️  Aucune donnée à restaurer\n`);
                continue;
            }

            // Insérer les données
            for (const row of rows) {
                const columns = Object.keys(row);
                const values = Object.values(row);
                const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

                const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
                await pool.query(query, values);
            }

            console.log(`   ✅ ${rows.length} lignes restaurées\n`);
        }

        // Réactiver les contraintes
        await pool.query('SET session_replication_role = DEFAULT;');

        console.log('✅ Restauration terminée avec succès!\n');

    } catch (err) {
        console.error('❌ Erreur lors de la restauration:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

async function main() {
    console.log('🔄 Script de Restauration de Base de Données\n');
    console.log('='.repeat(50) + '\n');

    const backups = await listBackups();

    if (backups.length === 0) {
        console.log('❌ Aucune sauvegarde disponible.');
        console.log('💡 Exécutez d\'abord: node backup_database.js\n');
        process.exit(1);
    }

    console.log('📋 Sauvegardes disponibles:\n');
    backups.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
    });

    console.log('\n⚠️  ATTENTION: Cette opération va SUPPRIMER toutes les données actuelles!\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Entrez le numéro de la sauvegarde à restaurer (ou "q" pour quitter): ', async (answer) => {
        rl.close();

        if (answer.toLowerCase() === 'q') {
            console.log('\n❌ Restauration annulée.\n');
            process.exit(0);
        }

        const index = parseInt(answer) - 1;

        if (isNaN(index) || index < 0 || index >= backups.length) {
            console.log('\n❌ Numéro invalide.\n');
            process.exit(1);
        }

        await restoreDatabase(backups[index]);
        process.exit(0);
    });
}

main().catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
});
