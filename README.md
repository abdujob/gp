# 📦 SendVoyage — Plateforme de livraison entre particuliers

> Mettez en relation des **expéditeurs** de colis avec des **livreurs** qui voyagent déjà vers leur destination.

---

## 📋 Table des matières

- [Aperçu du projet](#aperçu-du-projet)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Variables d'environnement](#variables-denvironnement)
- [API Routes](#api-routes)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)

---

## Aperçu du projet

**SendVoyage** est une plateforme web permettant à des particuliers de faire livrer leurs colis, documents ou marchandises par d'autres voyageurs qui se rendent déjà à la destination souhaitée. Les livreurs publient des annonces, les expéditeurs contactent ceux qui correspondent à leurs besoins.

---

## Stack technique

### Frontend (`/client`)
| Technologie | Version | Usage |
|---|---|---|
| **Next.js** | 16.1.1 | Framework React (App Router) |
| **React** | 19 | Interface utilisateur |
| **TypeScript** | ^5 | Typage statique |
| **Tailwind CSS** | ^4 | Styles |
| **Leaflet / Mapbox GL** | latest | Cartes interactives |
| **Lucide React** | latest | Icônes |
| **Axios** | ^1.13 | Requêtes HTTP |

### Backend (`/server`)
| Technologie | Version | Usage |
|---|---|---|
| **Node.js** | >=18 | Runtime |
| **Express** | ^5 | Framework HTTP |
| **PostgreSQL** | 15 | Base de données |
| **JWT** | ^9 | Authentification |
| **Bcrypt** | ^6 | Hachage des mots de passe |
| **Nodemailer** | ^7 | Envoi d'emails |
| **Multer** | ^2 | Upload de fichiers |
| **Helmet** | ^8 | Sécurité HTTP |
| **express-rate-limit** | ^8 | Limitation des requêtes |

---

## Architecture

```
gp/
├── client/                  # Application Next.js (frontend)
│   ├── app/
│   │   ├── page.tsx         # Page d'accueil
│   │   ├── about/           # À propos
│   │   ├── ads/             # Annonces
│   │   ├── dashboard/       # Tableau de bord utilisateur
│   │   ├── admin/           # Interface administration
│   │   ├── login/           # Connexion
│   │   ├── register/        # Inscription
│   │   ├── post-ad/         # Publier une annonce
│   │   ├── search/          # Recherche
│   │   └── forgot-password/ # Réinitialisation mot de passe
│   ├── components/          # Composants réutilisables
│   ├── contexts/            # Contextes React (auth, etc.)
│   ├── hooks/               # Hooks personnalisés
│   └── lib/                 # Utilitaires / helpers
│
├── server/                  # API REST (backend)
│   ├── server.js            # Point d'entrée Express
│   ├── db/
│   │   ├── schema.sql       # Schéma de la base de données
│   │   └── index.js         # Connexion PostgreSQL (pool)
│   ├── routes/
│   │   ├── auth.js          # Authentification
│   │   ├── ads.js           # Annonces
│   │   ├── admin.js         # Administration
│   │   └── deliveryPersons.js
│   ├── middleware/
│   │   └── rateLimiter.js   # Rate limiting
│   ├── utils/               # Fonctions utilitaires
│   └── uploads/             # Fichiers uploadés (images)
│
├── docker-compose.yml       # PostgreSQL via Docker
└── .env.example             # Template des variables d'environnement
```

---

## Fonctionnalités

- 🔐 **Authentification** — Inscription, connexion, vérification email, réinitialisation de mot de passe (JWT)
- 📢 **Annonces** — Création, recherche, filtrage d'annonces de livraison avec géolocalisation (carte)
- 💬 **Messagerie** — Système de messages entre expéditeurs et livreurs
- 🗺️ **Carte interactive** — Visualisation des annonces sur une carte (Leaflet / Mapbox)
- 🛡️ **Admin** — Interface d'administration pour la modération
- 📁 **Upload d'images** — Ajout de photos aux annonces (Multer)
- 🚦 **Rate Limiting** — Protection contre les abus (express-rate-limit)

---

## Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) (pour la base de données en local)
- npm >= 9

---

## Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd gp
```

### 2. Démarrer la base de données (Docker)

```bash
docker-compose up -d
```

Cela lance un conteneur PostgreSQL sur le port **5432** avec le schéma initialisé automatiquement.

### 3. Switcher les fichiers de config en mode local

Les fichiers suivants contiennent les deux configs (production et locale) sous forme de commentaires. Il suffit de commenter/décommenter les bonnes lignes.

#### `server/.env`

```env

DATABASE_URL=postgresql://admin:password123@localhost:5432/sendvoyage
```

#### `client/.env.production`



### 4. Installer les dépendances et démarrer



**Frontend** (dans un second terminal) :

### Résumé des URLs en local

| Service | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (Express) | http://localhost:5000 |
| PostgreSQL | localhost:5432 |

---

---

## API Routes

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion |
| `POST` | `/api/auth/forgot-password` | Demande de réinitialisation |
| `POST` | `/api/auth/reset-password` | Réinitialisation du mot de passe |
| `GET` | `/api/ads` | Liste des annonces |
| `POST` | `/api/ads` | Créer une annonce |
| `GET` | `/api/ads/:id` | Détail d'une annonce |
| `DELETE` | `/api/ads/:id` | Supprimer une annonce |
| `GET` | `/api/admin/*` | Routes administration (protégées) |
| `GET` | `/api/delivery-persons` | Liste des livreurs |

---

## Base de données

Le schéma SQL se trouve dans `server/db/schema.sql`. Il comprend :

- **`users`** — Utilisateurs (expéditeurs et livreurs)
- **`ads`** — Annonces de livraison (avec coordonnées GPS, type de transport, prix, capacité)
- **`messages`** — Messages entre utilisateurs

---

## Déploiement

Le projet supporte plusieurs plateformes de déploiement :

| Service | Fichier de config | Cible |
|---|---|---|
| **AWS Elastic Beanstalk** | `server/.elasticbeanstalk/` | Backend |
| **AWS Amplify** | `amplify.yml` | Frontend |
| **Docker** | `docker-compose.yml` | Base de données |

---


