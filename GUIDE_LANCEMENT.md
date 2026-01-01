# 🚀 Guide de Lancement - Plateforme GP

## Prérequis

- **Node.js** v18+ installé
- **PostgreSQL** installé et en cours d'exécution
- **Git** (optionnel)

---

## 🗄️ Étape 1: Configuration de la Base de Données

### 1.1 Créer la base de données
```bash
# Ouvrir PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE gp_db;

# Se connecter
\c gp_db
```

### 1.2 Exécuter le schéma
```bash
cd server/db
psql -U postgres -d gp_db -f schema.sql
```

### 1.3 Ajouter les colonnes destination
```bash
node add_destination_columns.js
```

### 1.4 Générer les données de test
```bash
node generate_test_data.js
```

### 1.5 Mettre à jour les destinations
```bash
node update_destinations.js
```

### 1.6 Mettre à jour les numéros WhatsApp
```bash
node update_phones.js
```

---

## ⚙️ Étape 2: Configuration Backend

### 2.1 Installer les dépendances
```bash
cd server
npm install
```

### 2.2 Configurer les variables d'environnement
Créer un fichier `.env` dans `/server` :
```env
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/gp_db
JWT_SECRET=votre_secret_jwt_super_securise
NODE_ENV=development
PORT=5000
```

### 2.3 Lancer le serveur
```bash
npm run start
```

**Résultat attendu:**
```
Server running on port 5000
```

---

## 🎨 Étape 3: Configuration Frontend

### 3.1 Installer les dépendances
```bash
cd client
npm install
```

### 3.2 Configurer l'API URL
Vérifier que `client/lib/api.ts` pointe vers le bon backend :
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
```

### 3.3 Lancer le client
```bash
npm run dev
```

**Résultat attendu:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## 🧪 Étape 4: Tests

### 4.1 Accéder à l'application
Ouvrir le navigateur : **http://localhost:3000**

### 4.2 Tester les fonctionnalités

#### Test 1: Page d'accueil
- ✅ Image hero visible
- ✅ Formulaire de recherche fonctionnel
- ✅ 6 annonces récentes affichées
- ✅ Bouton WhatsApp vert sur chaque carte

#### Test 2: Recherche intelligente
```
1. Cliquer sur le formulaire de recherche
2. Entrer: Départ = "Dakar", Arrivée = "Paris"
3. Cliquer "Rechercher"
```
**Résultat attendu:**
- Message contextuel (ex: "Aucun resultat exact trouve...")
- Liste d'annonces avec badges de pertinence
- Bouton WhatsApp sur chaque carte

#### Test 3: Bouton WhatsApp
```
1. Cliquer sur le bouton WhatsApp vert
```
**Résultat attendu:**
- Ouverture de WhatsApp Web/App
- Numéro: 0605954092
- Message pré-rempli avec titre et date de l'annonce

#### Test 4: Connexion Livreur
```
Identifiants de test:
Email: livreur1@test.com
Mot de passe: password123
```
**Résultat attendu:**
- Connexion réussie
- Bouton "Poster une annonce" visible
- Lien "Mes annonces" visible

---

## 📊 Données de Test Disponibles

- **60 utilisateurs** (50 livreurs GP, 10 expéditeurs)
- **105 annonces** France ↔ Sénégal
- **Tous avec numéro WhatsApp:** 0605954092
- **Toutes avec destinations géocodées**

### Exemples de trajets
- Dakar → Paris
- Paris → Dakar
- Dakar → Bordeaux
- Lyon → Thiès
- Touba → Paris

---

## 🐛 Dépannage

### Problème: "Server Error" lors de la recherche
**Solution:** Redémarrer le serveur backend
```bash
cd server
npm run start
```

### Problème: "Cannot connect to database"
**Solution:** Vérifier PostgreSQL
```bash
# Windows
pg_ctl status

# Démarrer si nécessaire
pg_ctl start
```

### Problème: Port 3000 ou 5000 déjà utilisé
**Solution:** Changer le port
```bash
# Backend: modifier .env
PORT=5001

# Frontend: modifier package.json
"dev": "next dev -p 3001"
```

### Problème: Images ne s'affichent pas
**Solution:** Vérifier que `/public/hero-image.png` existe
```bash
cd client
ls public/hero-image.png
```

---

## 🔄 Commandes Rapides

### Tout lancer en une fois (2 terminaux)

**Terminal 1 - Backend:**
```bash
cd server
npm run start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Réinitialiser la base de données
```bash
cd server/db
psql -U postgres -d gp_db -f schema.sql
node generate_test_data.js
node update_destinations.js
node update_phones.js
```

---

## ✅ Checklist de Vérification

Avant de tester, vérifier que :
- [ ] PostgreSQL est démarré
- [ ] Base de données `gp_db` créée
- [ ] Schéma SQL exécuté
- [ ] Données de test générées
- [ ] Fichier `.env` configuré
- [ ] Serveur backend lancé (port 5000)
- [ ] Client frontend lancé (port 3000)
- [ ] Image hero copiée dans `/public`

---

## 🎯 Fonctionnalités à Tester

### Priorité 1 (Critique)
- [ ] Recherche intelligente avec fallbacks
- [ ] Bouton WhatsApp sur toutes les annonces
- [ ] Connexion/Déconnexion
- [ ] Création d'annonce (livreur GP)

### Priorité 2 (Important)
- [ ] Badges de pertinence (distance, date, score)
- [ ] Messages contextuels de recherche
- [ ] Image hero responsive
- [ ] Navigation navbar

### Priorité 3 (Nice to have)
- [ ] Formulaire de recherche avec dates
- [ ] Cartes d'annonces responsive
- [ ] Profil utilisateur

---

## 📞 Support

En cas de problème, vérifier :
1. Les logs du serveur backend
2. La console du navigateur (F12)
3. Les variables d'environnement
4. La connexion à PostgreSQL

**Bon test ! 🚀**
