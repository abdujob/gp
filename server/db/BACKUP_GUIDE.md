# Système de Sauvegarde Automatique

## 🎯 Objectif

Éviter la perte de données lors de la réinitialisation de la base Render (tous les 90 jours) en créant des sauvegardes automatiques.

---

## 📋 Scripts Créés

### 1. `backup_database.js` - Sauvegarde
Exporte toutes les données de la base en JSON et SQL.

**Utilisation** :
```bash
cd server/db
node backup_database.js
```

**Résultat** :
- Crée `backups/backup_YYYY-MM-DD.json`
- Crée `backups/backup_YYYY-MM-DD.sql`
- Garde les 20 dernières sauvegardes

### 2. `restore_database.js` - Restauration
Restaure les données depuis une sauvegarde.

**Utilisation** :
```bash
cd server/db
node restore_database.js
```

**Processus** :
1. Liste les sauvegardes disponibles
2. Vous choisissez laquelle restaurer
3. Vide les tables et réimporte les données

---

## 🔄 Sauvegarde Automatique Hebdomadaire

### Option 1 : Cron Job Local (si vous avez un serveur)

Ajoutez à votre crontab :
```bash
# Sauvegarde tous les dimanches à 2h du matin
0 2 * * 0 cd /path/to/gp/server/db && node backup_database.js
```

### Option 2 : GitHub Actions (RECOMMANDÉ)

Créez `.github/workflows/backup.yml` :

```yaml
name: Database Backup

on:
  schedule:
    # Tous les dimanches à 2h UTC
    - cron: '0 2 * * 0'
  workflow_dispatch: # Permet de lancer manuellement

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd server
          npm install
      
      - name: Run backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd server/db
          node backup_database.js
      
      - name: Commit backup
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add server/db/backups/
          git commit -m "chore: automated database backup $(date +%Y-%m-%d)" || echo "No changes"
          git push
```

**Configuration** :
1. GitHub → Settings → Secrets → New repository secret
2. Nom : `DATABASE_URL`
3. Valeur : Votre URL de base Render

---

## 📅 Procédure en Cas de Réinitialisation

### Quand Render réinitialise la base (tous les 90 jours) :

1. **Restaurer les données** :
   ```bash
   cd server/db
   node restore_database.js
   ```

2. **Choisir la sauvegarde** la plus récente

3. **Vérifier** que tout fonctionne :
   ```bash
   # Tester la connexion
   node test_supabase_connection.js
   ```

---

## 🔐 Sécurité

### ⚠️ Important :

Les fichiers de sauvegarde contiennent :
- Mots de passe hashés
- Emails
- Données sensibles

### Protection :

1. **Ajoutez au `.gitignore`** :
   ```
   server/db/backups/*.json
   server/db/backups/*.sql
   ```

2. **Sauvegardez ailleurs** :
   - Google Drive
   - Dropbox
   - AWS S3

---

## 🧪 Test

### Tester la sauvegarde :
```bash
cd server/db
node backup_database.js
```

Vous devriez voir :
```
🔄 Début de la sauvegarde...
📦 Sauvegarde de la table "users"...
   ✅ 2 lignes sauvegardées
📦 Sauvegarde de la table "ads"...
   ✅ 5 lignes sauvegardées
...
✅ Sauvegarde terminée avec succès!
```

### Tester la restauration :
```bash
cd server/db
node restore_database.js
```

---

## 📊 Monitoring

### Vérifier les sauvegardes :
```bash
ls -lh server/db/backups/
```

### Voir le contenu d'une sauvegarde :
```bash
cat server/db/backups/backup_2026-02-02.json
```

---

## 🎯 Avantages

✅ **Automatique** - Pas besoin d'y penser
✅ **Fiable** - Sauvegarde JSON + SQL
✅ **Versionné** - Garde 20 versions
✅ **Gratuit** - Utilise GitHub Actions
✅ **Simple** - 1 commande pour restaurer

---

## 💡 Recommandations

1. **Testez** la restauration une fois par mois
2. **Sauvegardez manuellement** avant les gros changements
3. **Gardez une copie** hors GitHub (Google Drive)
4. **Surveillez** les GitHub Actions pour vérifier que ça fonctionne
