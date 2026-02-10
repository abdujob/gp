require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false
});

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups');

    // Créer le dossier backups s'il n'existe pas
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('🔄 Début de la sauvegarde de la base de données...\n');

    try {
        const tables = ['users', 'ads', 'refresh_tokens', 'password_resets'];
        const backupData = {
            timestamp,
            database: 'gp_database',
            tables: {}
        };

        for (const table of tables) {
            console.log(`📦 Sauvegarde de la table "${table}"...`);

            const result = await pool.query(`SELECT * FROM ${table}`);
            backupData.tables[table] = result.rows;

            console.log(`   ✅ ${result.rows.length} lignes sauvegardées`);
        }

        // Sauvegarder en JSON
        const jsonFile = path.join(backupDir, `backup_${timestamp}.json`);
        fs.writeFileSync(jsonFile, JSON.stringify(backupData, null, 2));
        console.log(`\n💾 Sauvegarde JSON créée: ${jsonFile}`);

        // Créer aussi un fichier SQL
        const sqlFile = path.join(backupDir, `backup_${timestamp}.sql`);
        let sqlContent = `-- Backup created at ${new Date().toISOString()}\n\n`;

        for (const [tableName, rows] of Object.entries(backupData.tables)) {
            if (rows.length === 0) continue;

            sqlContent += `-- Table: ${tableName}\n`;
            sqlContent += `TRUNCATE TABLE ${tableName} CASCADE;\n\n`;

            for (const row of rows) {
                const columns = Object.keys(row);
                const values = columns.map(col => {
                    const val = row[col];
                    if (val === null) return 'NULL';
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                    if (val instanceof Date) return `'${val.toISOString()}'`;
                    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                    return val;
                });

                sqlContent += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
            }
            sqlContent += '\n';
        }

        fs.writeFileSync(sqlFile, sqlContent);
        console.log(`💾 Sauvegarde SQL créée: ${sqlFile}`);

        // Statistiques
        console.log('\n📊 Statistiques de sauvegarde:');
        for (const [table, rows] of Object.entries(backupData.tables)) {
            console.log(`   - ${table}: ${rows.length} lignes`);
        }

        console.log('\n✅ Sauvegarde terminée avec succès!\n');

        // Nettoyer les anciennes sauvegardes (garder seulement les 10 dernières)
        cleanOldBackups(backupDir);

    } catch (err) {
        console.error('❌ Erreur lors de la sauvegarde:', err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

function cleanOldBackups(backupDir) {
    const files = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('backup_'))
        .sort()
        .reverse();

    if (files.length > 20) {
        console.log('\n🧹 Nettoyage des anciennes sauvegardes...');
        const toDelete = files.slice(20);
        toDelete.forEach(file => {
            fs.unlinkSync(path.join(backupDir, file));
            console.log(`   🗑️  Supprimé: ${file}`);
        });
    }
}

// Exécuter la sauvegarde
backupDatabase()
    .then(() => {
        console.log('🎉 Processus terminé!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Échec:', err);
        process.exit(1);
    });
