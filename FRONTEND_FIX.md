# 🔍 Diagnostic Frontend Render - Not Found

## Problème
L'URL `https://gp-frontend-9pm5.onrender.com` retourne "Not Found"

## Causes Possibles

### 1. Build Command Incorrect
Next.js nécessite une configuration spéciale pour Render.

**Solution:** Vérifier que le Build Command est correct

### 2. Publish Directory Incorrect
Next.js en mode static nécessite un export.

**Solution:** Utiliser le bon répertoire de publication

### 3. Configuration Next.js Manquante
Next.js doit être configuré pour l'export statique.

---

## 🔧 Corrections à Appliquer sur Render

### Option 1: Déployer comme Web Service (Recommandé)

**Au lieu de "Static Site", utilisez "Web Service":**

1. Sur Render Dashboard, **supprimez** le Static Site actuel
2. Créez un nouveau **"Web Service"**
3. Configurez :
   - **Name:** `gp-frontend`
   - **Root Directory:** `client`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Variables d'environnement:**
```
NEXT_PUBLIC_API_URL = https://gp-backend-skwd.onrender.com/api
```

5. **Créer** le service

---

### Option 2: Corriger le Static Site

Si vous voulez garder Static Site, il faut :

1. **Modifier** `client/package.json` - ajouter script build:
```json
"scripts": {
  "build": "next build && next export"
}
```

2. **Créer** `client/next.config.js`:
```javascript
module.exports = {
  output: 'export',
  images: {
    unoptimized: true
  }
}
```

3. **Sur Render**, modifier :
   - Build Command: `npm install && npm run build`
   - Publish Directory: `out`

4. **Redéployer**

---

## ✅ Solution Recommandée

**Utilisez Option 1 (Web Service)** car :
- Plus simple
- Pas besoin de modifier le code
- Support complet de Next.js
- Même plan gratuit

---

## 📋 Étapes à Suivre

1. Allez sur https://dashboard.render.com
2. Supprimez le service `gp-frontend` actuel
3. Créez un nouveau **Web Service** (pas Static Site)
4. Suivez la configuration de l'Option 1 ci-dessus
5. Attendez le déploiement (5-10 min)
6. Testez la nouvelle URL

**Voulez-vous que je vous guide étape par étape ?**
