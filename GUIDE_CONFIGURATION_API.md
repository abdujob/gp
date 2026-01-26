# 🔧 Guide : Configurer l'URL de l'API Backend dans AWS Amplify

## Problème Identifié

Le frontend sur AWS Amplify utilise actuellement CloudFront qui pointe vers un ancien backend AWS Elastic Beanstalk qui ne fonctionne plus.

**Backend actuel (ne fonctionne pas)** : `d2fy4fjpaisnki.cloudfront.net/api`  
**Backend correct (fonctionne)** : `https://gp-backend-skwd.onrender.com/api`

---

## Solution : Configurer la Variable d'Environnement

### Étape 1 : Accéder à AWS Amplify Console

1. Ouvrez votre navigateur
2. Allez sur : **https://console.aws.amazon.com/amplify/**
3. Connectez-vous avec vos identifiants AWS si nécessaire

### Étape 2 : Sélectionner votre Application

1. Dans la liste des applications, cliquez sur votre application **"gp"**
2. Vous devriez voir le tableau de bord de l'application

### Étape 3 : Accéder aux Variables d'Environnement

1. Dans le menu de gauche, cliquez sur **"Environment variables"** (Variables d'environnement)
   - Ou allez dans **"App settings"** → **"Environment variables"**

### Étape 4 : Ajouter/Modifier la Variable

#### Si la variable `NEXT_PUBLIC_API_URL` existe déjà :

1. Trouvez la ligne avec `NEXT_PUBLIC_API_URL`
2. Cliquez sur **"Edit"** (Modifier)
3. Changez la valeur en : `https://gp-backend-skwd.onrender.com/api`
4. Cliquez sur **"Save"** (Enregistrer)

#### Si la variable n'existe pas :

1. Cliquez sur **"Add variable"** (Ajouter une variable)
2. Dans **"Variable"** (Nom), entrez : `NEXT_PUBLIC_API_URL`
3. Dans **"Value"** (Valeur), entrez : `https://gp-backend-skwd.onrender.com/api`
4. Cliquez sur **"Save"** (Enregistrer)

### Étape 5 : Redéployer l'Application

**Important** : Les variables d'environnement ne sont appliquées qu'au prochain build.

1. Retournez à la page principale de l'application
2. Dans le menu de gauche, cliquez sur **"Deployments"** ou **"All apps"**
3. Trouvez la branche **"main"**
4. Cliquez sur le bouton **"Redeploy this version"** (Redéployer cette version)
   - Ou cliquez sur les trois points ⋮ → **"Redeploy"**

### Étape 6 : Attendre le Déploiement

1. Le build va démarrer automatiquement
2. Attendez que toutes les étapes soient complètes (5-10 minutes) :
   - ✅ Provision
   - ✅ Build
   - ✅ Deploy
   - ✅ Verify

### Étape 7 : Vérifier que ça Fonctionne

Une fois le déploiement terminé :

1. Allez sur **https://gp.senecoins.com/**
2. Ouvrez les outils de développement (F12)
3. Allez dans l'onglet **Console**
4. Rechargez la page (Ctrl+R)
5. Vérifiez qu'il n'y a **plus d'erreurs 500**
6. Les annonces devraient maintenant se charger correctement

---

## Alternative : Utiliser AWS CLI

Si vous préférez utiliser la ligne de commande :

```bash
# Mettre à jour la variable d'environnement
aws amplify update-app --app-id d2caxflzc9bgu5 --environment-variables NEXT_PUBLIC_API_URL=https://gp-backend-skwd.onrender.com/api

# Déclencher un nouveau build
aws amplify start-job --app-id d2caxflzc9bgu5 --branch-name main --job-type RELEASE
```

---

## Vérification Post-Déploiement

### Test 1 : Vérifier l'URL de l'API

1. Allez sur https://gp.senecoins.com/
2. Ouvrez la console (F12) → onglet **Network**
3. Rechargez la page
4. Cherchez les requêtes vers `/api/ads`
5. Vérifiez que l'URL est : `https://gp-backend-skwd.onrender.com/api/ads`

### Test 2 : Vérifier le Chargement des Annonces

1. La page d'accueil devrait afficher les annonces
2. Aucune erreur 500 dans la console
3. Le message "Chargement des annonces..." devrait disparaître

### Test 3 : Tester l'Inscription

1. Allez sur https://gp.senecoins.com/register
2. Essayez de créer un compte
3. Aucune erreur 500 ne devrait apparaître

---

## En Cas de Problème

### Le build échoue

- Vérifiez les logs du build dans Amplify
- Assurez-vous que la variable est bien `NEXT_PUBLIC_API_URL` (avec le préfixe `NEXT_PUBLIC_`)

### Les erreurs 500 persistent

1. Videz le cache CloudFront :
   - Allez dans CloudFront console
   - Sélectionnez votre distribution
   - Créez une invalidation pour `/*`

2. Vérifiez que le backend Render fonctionne :
   ```bash
   curl https://gp-backend-skwd.onrender.com/api/ads?limit=1
   ```

### Le backend Render est en veille

- Le plan gratuit de Render met le service en veille après 15 min d'inactivité
- La première requête peut prendre 30-60 secondes pour "réveiller" le service
- Attendez et réessayez

---

## Résumé des Actions

- [ ] Aller sur AWS Amplify Console
- [ ] Sélectionner l'application "gp"
- [ ] Aller dans "Environment variables"
- [ ] Ajouter/Modifier `NEXT_PUBLIC_API_URL` = `https://gp-backend-skwd.onrender.com/api`
- [ ] Sauvegarder
- [ ] Redéployer l'application
- [ ] Attendre la fin du build (5-10 min)
- [ ] Tester sur https://gp.senecoins.com/

---

## Note Importante

Une fois cette configuration faite :
- ✅ Le SEO sera fonctionnel (déjà déployé)
- ✅ Le backend fonctionnera correctement
- ✅ Les utilisateurs pourront voir les annonces
- ✅ L'inscription/connexion fonctionnera

Bonne chance ! 🚀
