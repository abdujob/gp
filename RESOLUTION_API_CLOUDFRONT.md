# 🔧 Résolution : Site Utilise Toujours CloudFront

## Problème
Vous avez changé la variable `NEXT_PUBLIC_API_URL` dans Amplify, mais le site utilise toujours :
```
https://d2fy4fjpaisnki.cloudfront.net/api
```

Au lieu de :
```
https://gp-backend-skwd.onrender.com/api
```

---

## ✅ Actions à Faire MAINTENANT

### 1️⃣ Vérifier le Build Amplify (IMPORTANT)

**Le changement de variable d'environnement ne prend effet qu'après un nouveau build !**

1. Allez sur : https://console.aws.amazon.com/amplify/
2. Cliquez sur votre application "gp"
3. Regardez le statut du dernier build

**Le build doit être :**
- ✅ **SUCCEED** (Réussi) avec toutes les étapes vertes
- ⏳ **IN_PROGRESS** → Attendez qu'il se termine (5-10 min)
- ❌ **FAILED** → Il y a un problème, regardez les logs

**Si le build n'a PAS démarré automatiquement après le changement de variable :**
1. Cliquez sur le bouton **"Redeploy this version"**
2. Ou allez dans "Deployments" → Trouvez la branche "main" → Cliquez sur "Redeploy"

### 2️⃣ Attendre la Fin du Build

**NE PAS TESTER LE SITE AVANT QUE LE BUILD SOIT TERMINÉ !**

Le build passe par ces étapes :
1. ✅ Provision (30 sec)
2. ✅ Build (3-5 min)
3. ✅ Deploy (1-2 min)
4. ✅ Verify (30 sec)

**Total : environ 5-10 minutes**

### 3️⃣ Vider le Cache du Navigateur

Une fois le build **TERMINÉ ET RÉUSSI** :

**Option A : Mode Navigation Privée (Plus Simple)**
1. Appuyez sur **Ctrl + Shift + N** (Chrome/Edge)
2. Allez sur https://gp.senecoins.com/
3. Testez l'inscription

**Option B : Vider le Cache**
1. Appuyez sur **Ctrl + Shift + Delete**
2. Cochez "Images et fichiers en cache"
3. Cliquez sur "Effacer les données"
4. Rechargez https://gp.senecoins.com/

**Option C : Rechargement Forcé**
1. Allez sur https://gp.senecoins.com/
2. Appuyez sur **Ctrl + Shift + R** (rechargement forcé)

### 4️⃣ Vérifier que Ça Fonctionne

1. Ouvrez les outils de développement (**F12**)
2. Allez dans l'onglet **Network**
3. Rechargez la page
4. Cherchez les requêtes vers `/api/`
5. Vérifiez que l'URL est : `https://gp-backend-skwd.onrender.com/api/`

**Si vous voyez encore `cloudfront.net`** → Le build n'est pas terminé ou le cache n'est pas vidé

---

## 🚨 Si Ça Ne Fonctionne Toujours Pas

### Vérifier les Variables d'Environnement Amplify

1. Allez sur AWS Amplify Console
2. Cliquez sur "Environment variables"
3. Vérifiez que vous avez bien :
   - **Variable** : `NEXT_PUBLIC_API_URL`
   - **Valeur** : `https://gp-backend-skwd.onrender.com/api`

**ATTENTION** : Le nom doit être **EXACTEMENT** `NEXT_PUBLIC_API_URL` (avec le préfixe `NEXT_PUBLIC_`)

### Déclencher un Nouveau Build Manuellement

Si le build ne s'est pas lancé automatiquement :

**Via Console AWS :**
1. Allez dans "Deployments"
2. Trouvez la branche "main"
3. Cliquez sur "Redeploy this version"

**Via CLI :**
```powershell
aws amplify start-job --app-id d2caxflzc9bgu5 --branch-name main --job-type RELEASE
```

---

## 📊 Checklist de Vérification

- [ ] Variable `NEXT_PUBLIC_API_URL` configurée dans Amplify
- [ ] Valeur = `https://gp-backend-skwd.onrender.com/api`
- [ ] Nouveau build déclenché
- [ ] Build terminé avec succès (toutes les étapes vertes)
- [ ] Cache du navigateur vidé OU mode navigation privée
- [ ] Site testé sur https://gp.senecoins.com/
- [ ] Outils de développement (F12) → Network → Vérifié que l'URL est correcte

---

## 🎯 Résultat Attendu

Après ces étapes, vous devriez voir dans la console (F12 → Network) :

✅ **Avant** : `POST https://d2fy4fjpaisnki.cloudfront.net/api/auth/register` → ❌ 429 Error

✅ **Après** : `POST https://gp-backend-skwd.onrender.com/api/auth/register` → ✅ 200 OK

---

## ⏱️ Combien de Temps Attendre ?

| Étape | Durée |
|-------|-------|
| Changement de variable | Immédiat |
| Démarrage du build | 1-2 min |
| Build complet | 5-10 min |
| Propagation | Immédiat après build |
| **TOTAL** | **~10-15 minutes** |

**Patience !** Attendez que le build soit complètement terminé avant de tester.

---

## 💡 Astuce

Pour vérifier rapidement si le nouveau build est déployé :
1. Allez sur https://gp.senecoins.com/
2. Ouvrez la console (F12)
3. Tapez : `console.log(process.env.NEXT_PUBLIC_API_URL)`
4. Si ça affiche `https://gp-backend-skwd.onrender.com/api` → ✅ C'est bon !
5. Si ça affiche autre chose ou `undefined` → ❌ Attendez le build

---

Dites-moi quand le build est terminé et je vous aiderai à vérifier ! 🚀
