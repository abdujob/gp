# Guide de Vérification du Déploiement SEO

## ✅ Code Déployé

Le code a été poussé avec succès vers GitHub :
- **Commit**: `9c625e3` - "SEO: Optimize for Google search visibility..."
- **Branch**: main
- **Fichiers modifiés**:
  - `client/app/layout.tsx`
  - `client/app/page.tsx`
  - `client/lib/metadata.ts` (nouveau)
  - `client/public/robots.txt`
  - `client/public/sitemap.xml`

AWS Amplify devrait automatiquement détecter le push et lancer un nouveau build.

---

## 🔍 Étapes de Vérification

### 1. Vérifier le Déploiement Amplify

**Option A : Via Console AWS** (Recommandé)
1. Allez sur https://console.aws.amazon.com/amplify/
2. Connectez-vous si nécessaire
3. Cliquez sur votre application "gp"
4. Vérifiez le statut du dernier build :
   - ✅ **Provision** → **Build** → **Deploy** → **Verify**
   - Attendez que toutes les étapes soient vertes
   - Durée estimée : 5-10 minutes

**Option B : Via AWS CLI**
```bash
# Lister les apps Amplify
aws amplify list-apps

# Obtenir les détails de build (remplacez APP_ID)
aws amplify list-jobs --app-id d2caxflzc9bgu5 --branch-name main --max-results 1
```

### 2. Tester le Site en Production

Une fois le déploiement terminé, visitez : **https://gp.senecoins.com/**

#### Vérifications Visuelles
- [ ] Le titre de l'onglet affiche : "GP Senegal - Envoi de Colis France Senegal via Voyageurs"
- [ ] Le H1 affiche : "GP Senegal - Envoyez vos colis France Sénégal"
- [ ] La nouvelle section "Comment fonctionne GP Senegal ?" est visible
- [ ] Les 3 étapes sont affichées avec les icônes

#### Vérifier les Métadonnées SEO

**Méthode 1 : Voir le code source**
1. Clic droit sur la page → **Afficher le code source de la page**
2. Cherchez (Ctrl+F) :
   - `<title>GP Senegal` ✅
   - `<meta name="description"` ✅
   - `<meta name="keywords"` ✅
   - `<meta property="og:title"` ✅ (Open Graph)
   - `<script type="application/ld+json"` ✅ (Structured Data)

**Méthode 2 : Outils de développement**
1. Appuyez sur **F12** pour ouvrir DevTools
2. Allez dans l'onglet **Elements**
3. Regardez dans `<head>` pour voir toutes les balises meta

### 3. Vérifier robots.txt et sitemap.xml

Visitez ces URLs directement :

- **robots.txt** : https://gp.senecoins.com/robots.txt
  - Devrait afficher :
    ```
    User-agent: *
    Allow: /
    
    Sitemap: https://gp.senecoins.com/sitemap.xml
    ```

- **sitemap.xml** : https://gp.senecoins.com/sitemap.xml
  - Devrait lister toutes les pages avec `gp.senecoins.com`
  - Date : 2026-01-26

### 4. Tester avec les Outils SEO

#### Google Rich Results Test
1. Allez sur : https://search.google.com/test/rich-results
2. Entrez : `https://gp.senecoins.com/`
3. Cliquez sur **Test URL**
4. Vérifiez :
   - ✅ Organization détectée
   - ✅ WebSite détecté
   - ✅ Aucune erreur

#### Open Graph Preview
1. Allez sur : https://www.opengraph.xyz/
2. Entrez : `https://gp.senecoins.com/`
3. Vérifiez l'aperçu pour Facebook/LinkedIn

#### Lighthouse SEO Audit
1. Ouvrez Chrome DevTools (F12)
2. Allez dans l'onglet **Lighthouse**
3. Sélectionnez **SEO** uniquement
4. Cliquez sur **Generate report**
5. **Score cible** : 90+ / 100

---

## 📊 Configuration Google Search Console

### Étape 1 : Créer la Propriété

1. Allez sur : https://search.google.com/search-console
2. Cliquez sur **Ajouter une propriété**
3. Choisissez **Domaine** : `gp.senecoins.com`

### Étape 2 : Vérifier la Propriété (DNS)

Google vous donnera un enregistrement TXT à ajouter :
```
google-site-verification=VOTRE_CODE_ICI
```

**Sur o2switch** :
1. Connectez-vous à votre panneau o2switch
2. Allez dans **Zone DNS** ou **DNS Zone Editor**
3. Ajoutez un enregistrement **TXT** :
   - **Nom** : @ (ou laissez vide)
   - **Type** : TXT
   - **Valeur** : Le code de vérification Google
   - **TTL** : 3600

4. Attendez 5-30 minutes pour la propagation DNS
5. Retournez sur Google Search Console et cliquez **Vérifier**

### Étape 3 : Soumettre le Sitemap

Une fois vérifié :
1. Dans Google Search Console, allez dans **Sitemaps** (menu gauche)
2. Entrez : `sitemap.xml`
3. Cliquez sur **Envoyer**
4. Statut devrait passer à **Réussi**

### Étape 4 : Demander l'Indexation

Pour accélérer l'indexation :
1. Allez dans **Inspection de l'URL**
2. Entrez chaque URL importante :
   - `https://gp.senecoins.com/`
   - `https://gp.senecoins.com/search`
   - `https://gp.senecoins.com/post-ad`
3. Cliquez sur **Demander une indexation**

---

## 📈 Suivi des Résultats

### Vérifier l'Indexation Google

Après 24-48 heures, testez :
```
site:gp.senecoins.com
```
Dans Google Search. Vous devriez voir vos pages apparaître.

### Surveiller les Performances

Dans Google Search Console (après 3-7 jours) :
1. **Performances** → Voir les requêtes de recherche
2. Cherchez vos mots-clés cibles :
   - gp senegal
   - gp dakar
   - gp france senegal
   - colis france senegal

### Timeline Attendue

| Délai | Résultat Attendu |
|-------|------------------|
| **Immédiat** | Code déployé sur gp.senecoins.com |
| **24-48h** | Google découvre le sitemap |
| **3-7 jours** | Premières pages indexées |
| **1-2 semaines** | Apparition pour "gp senegal" |
| **2-4 semaines** | Ranking amélioré pour tous les mots-clés |

---

## ✅ Checklist de Vérification

- [ ] Déploiement Amplify terminé avec succès
- [ ] Site accessible sur https://gp.senecoins.com/
- [ ] Métadonnées visibles dans le code source
- [ ] robots.txt accessible et correct
- [ ] sitemap.xml accessible et correct
- [ ] Google Rich Results Test : aucune erreur
- [ ] Lighthouse SEO score : 90+
- [ ] Google Search Console : propriété créée
- [ ] Google Search Console : domaine vérifié
- [ ] Sitemap soumis à Google
- [ ] Indexation demandée pour pages principales

---

## 🆘 En Cas de Problème

### Le build Amplify échoue
- Vérifiez les logs dans la console Amplify
- Les erreurs TypeScript sont les plus courantes
- Le build local a réussi, donc ça devrait fonctionner

### Les métadonnées n'apparaissent pas
- Videz le cache du navigateur (Ctrl+Shift+R)
- Vérifiez que vous êtes bien sur gp.senecoins.com (pas l'URL Amplify)
- Attendez quelques minutes après le déploiement

### Google Search Console : Vérification échoue
- Vérifiez que l'enregistrement TXT est bien ajouté
- Attendez plus longtemps (jusqu'à 1 heure)
- Utilisez un outil de vérification DNS : https://mxtoolbox.com/TXTLookup.aspx

### Le site n'apparaît pas dans Google
- C'est normal les premiers jours
- Soyez patient, l'indexation prend du temps
- Continuez à créer du contenu de qualité
- Partagez le site sur les réseaux sociaux

---

## 📞 Prochaines Étapes Recommandées

1. **Créer une page FAQ** avec questions fréquentes
2. **Ajouter une page "À propos"** pour expliquer GP Senegal
3. **Créer du contenu blog** sur l'envoi de colis
4. **Partager sur les réseaux sociaux** (Facebook, WhatsApp)
5. **Encourager les avis utilisateurs**

Bonne chance avec votre référencement ! 🚀
