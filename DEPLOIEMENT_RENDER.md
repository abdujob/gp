# 🚀 Déploiement sur Render - Guide Complet

## 📋 Prérequis

1. Compte GitHub (pour héberger le code)
2. Compte Render (gratuit) : https://render.com

---

## Étape 1: Préparer le Projet pour Git

### 1.1 Initialiser Git (si pas déjà fait)
```bash
cd C:\Users\Abdou\Desktop\gp
git init
git add .
git commit -m "Initial commit - GP Platform"
```

### 1.2 Créer un dépôt GitHub
1. Aller sur https://github.com/new
2. Nom du dépôt : `gp-platform`
3. Public ou Private (au choix)
4. Ne pas initialiser avec README

### 1.3 Pousser le code
```bash
git remote add origin https://github.com/VOTRE_USERNAME/gp-platform.git
git branch -M main
git push -u origin main
```

---

## Étape 2: Créer la Base de Données PostgreSQL sur Render

1. Aller sur https://dashboard.render.com
2. Cliquer sur **"New +"** → **"PostgreSQL"**
3. Configuration :
   - **Name:** `gp-database`
   - **Database:** `gp_db`
   - **User:** `gp_user` (auto-généré)
   - **Region:** Frankfurt (Europe)
   - **Plan:** Free
4. Cliquer **"Create Database"**
5. **Attendre 2-3 minutes** que la DB soit créée
6. **Copier l'URL** "Internal Database URL" (commence par `postgresql://`)

---

## Étape 3: Déployer le Backend

1. Cliquer sur **"New +"** → **"Web Service"**
2. Connecter votre dépôt GitHub `gp-platform`
3. Configuration :
   - **Name:** `gp-backend`
   - **Region:** Frankfurt
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Variables d'environnement** (cliquer "Advanced") :
   ```
   DATABASE_URL=postgresql://... (URL copiée étape 2)
   JWT_SECRET=votre_secret_super_securise_123456
   NODE_ENV=production
   PORT=5000
   ```

5. Cliquer **"Create Web Service"**
6. **Attendre 5-10 minutes** le déploiement
7. **Copier l'URL** (ex: `https://gp-backend.onrender.com`)

---

## Étape 4: Initialiser la Base de Données

### 4.1 Se connecter à la DB via Render Dashboard
1. Aller dans votre PostgreSQL database
2. Cliquer sur **"Connect"** → **"External Connection"**
3. Copier la commande `psql`

### 4.2 Exécuter le schéma
```bash
# Depuis votre machine locale
psql "postgresql://..." -f server/db/schema.sql
```

### 4.3 Générer les données (optionnel)
Modifier `server/db/generate_test_data.js` pour utiliser l'URL Render, puis :
```bash
node server/db/generate_test_data.js
node server/db/add_destination_columns.js
node server/db/update_destinations.js
node server/db/update_phones.js
```

---

## Étape 5: Déployer le Frontend

1. Cliquer sur **"New +"** → **"Static Site"**
2. Connecter le même dépôt GitHub
3. Configuration :
   - **Name:** `gp-frontend`
   - **Branch:** `main`
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `.next`
   - **Plan:** Free

4. **Variables d'environnement** :
   ```
   NEXT_PUBLIC_API_URL=https://gp-backend.onrender.com/api
   ```

5. Cliquer **"Create Static Site"**
6. **Attendre 5-10 minutes**

---

## Étape 6: Tester le Déploiement

### URL Frontend
```
https://gp-frontend.onrender.com
```

### Tests à effectuer
- [ ] Page d'accueil charge
- [ ] Recherche fonctionne
- [ ] Bouton WhatsApp fonctionne
- [ ] Connexion fonctionne
- [ ] Création d'annonce (livreur)

---

## 🐛 Dépannage

### Problème: "Application failed to respond"
**Cause:** Le backend met du temps à démarrer (plan gratuit)
**Solution:** Attendre 1-2 minutes, rafraîchir

### Problème: "Database connection failed"
**Cause:** URL de base de données incorrecte
**Solution:** Vérifier DATABASE_URL dans les variables d'environnement

### Problème: "API calls failing"
**Cause:** CORS ou URL API incorrecte
**Solution:** Vérifier NEXT_PUBLIC_API_URL dans le frontend

### Problème: Images ne s'affichent pas
**Cause:** Chemin d'upload incorrect
**Solution:** Utiliser un service de stockage externe (Cloudinary, AWS S3)

---

## ⚡ Limitations du Plan Gratuit

- **Backend:** Se met en veille après 15min d'inactivité
- **Redémarrage:** 30-60 secondes au premier accès
- **Base de données:** 90 jours d'expiration (peut être renouvelée)
- **Build time:** 500 heures/mois

---

## 🔄 Mises à Jour

Pour mettre à jour après modifications :
```bash
git add .
git commit -m "Description des changements"
git push
```

Render redéploiera automatiquement ! ✨

---

## 📱 Partager avec des Testeurs

Envoyez simplement l'URL :
```
https://gp-frontend.onrender.com
```

**URLs permanentes** - Pas besoin de relancer ! 🎉

---

## 💡 Prochaines Étapes (Optionnel)

1. **Domaine personnalisé** (ex: `gp.votredomaine.com`)
2. **Stockage images** avec Cloudinary
3. **Monitoring** avec Render Dashboard
4. **Logs** pour débugger

**Bon déploiement ! 🚀**
