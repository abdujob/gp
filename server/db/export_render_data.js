require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Connexion à la base Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function exportTable(tableName, outputFile) {
    console.log(`\n📦 Export de la table "${tableName}"...`);

    try {
        // Récupérer toutes les données
        const result = await pool.query(`SELECT * FROM ${tableName}`);

        if (result.rows.length === 0) {
            console.log(`   ⚠️  Table "${tableName}" vide, aucune donnée à exporter`);
            return;
        }

        console.log(`   ✅ ${result.rows.length} lignes trouvées`);

        // Générer les INSERT statements
        let sql = `-- Export de la table ${tableName}\n`;
        sql += `-- Date: ${new Date().toISOString()}\n`;
        sql += `-- Nombre de lignes: ${result.rows.length}\n\n`;

        for (const row of result.rows) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
                const val = row[col];
                if (val === null) return 'NULL';
                if (typeof val === 'string') {
                    // Échapper les apostrophes
                    return `'${val.replace(/'/g, "''")}'`;
                }
                if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                if (val instanceof Date) return `'${val.toISOString()}'`;
                if (typeof val === 'object') {
                    // Pour les JSON
                    return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                }
                return val;
            });

            sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }

        // Écrire dans le fichier
        fs.writeFileSync(outputFile, sql);
        console.log(`   💾 Exporté vers: ${outputFile}`);

    } catch (err) {
        console.error(`   ❌ Erreur lors de l'export de ${tableName}:`, err.message);
    }
}

async function exportAll() {
    console.log('🚀 Début de l\'export des données Render\n');
    console.log('='.repeat(50));

    const exportDir = path.join(__dirname, 'exports');

    // Créer le dossier exports s'il n'existe pas
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir);
        console.log(`📁 Dossier créé: ${exportDir}\n`);
    }

    // Liste des tables à exporter
    const tables = [
        { name: 'users', file: path.join(exportDir, 'users_export.sql') },
        { name: 'ads', file: path.join(exportDir, 'ads_export.sql') },
        { name: 'refresh_tokens', file: path.join(exportDir, 'refresh_tokens_export.sql') },
        { name: 'password_resets', file: path.join(exportDir, 'password_resets_export.sql') }
    ];

    // Exporter chaque table
    for (const table of tables) {
        await exportTable(table.name, table.file);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Export terminé !');
    console.log(`\n📂 Fichiers exportés dans: ${exportDir}`);
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Vérifiez les fichiers SQL générés');
    console.log('   2. Importez-les dans Supabase via SQL Editor');
    console.log('   3. Vérifiez que les données sont correctes\n');

    await pool.end();
}

// Exécuter l'export
exportAll()
    .then(() => {
        console.log('🎉 Processus terminé avec succès!\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erreur fatale:', err);
        process.exit(1);
    });
