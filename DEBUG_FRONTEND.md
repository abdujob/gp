# 🔧 Correction Frontend Render - Not Found

## Diagnostic

Le build réussit mais le site retourne 404. Causes possibles :

### 1. Start Command Incorrecte
Render essaie peut-être de démarrer depuis la racine au lieu de `/client`

### 2. Port Non Configuré
Next.js démarre sur le port 3000 par défaut, mais Render attend le port défini dans `$PORT`

---

## ✅ Solution : Vérifier la Configuration Render

### Sur Render Dashboard :

1. Allez dans votre service **gp-frontend**
2. Cliquez sur **"Settings"** (à gauche)
3. Vérifiez :

**Root Directory:**
```
client
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

4. **Scrollez** jusqu'à **"Environment Variables"**
5. Ajoutez si manquant :
```
NEXT_PUBLIC_API_URL = https://gp-backend-skwd.onrender.com/api
PORT = 3000
```

6. **Sauvegardez** et **redéployez** (bouton "Manual Deploy" → "Deploy latest commit")

---

## Alternative : Vérifier les Logs

1. Dans votre service gp-frontend
2. Cliquez sur **"Logs"**
3. Cherchez des erreurs comme :
   - `ENOENT: no such file or directory`
   - `Cannot find module`
   - `Port already in use`

**Copiez-moi** les dernières lignes des logs si vous voyez des erreurs.

---

## Si Ça Ne Fonctionne Toujours Pas

Le problème peut venir du fait que Render cherche dans le mauvais dossier.

**Solution de secours :**

Créer un fichier `package.json` à la racine du projet qui redirige vers client :

```json
{
  "name": "gp-platform",
  "scripts": {
    "start": "cd client && npm start",
    "build": "cd client && npm install && npm run build"
  }
}
```

Puis sur Render :
- Root Directory: `` (vide, racine)
- Build Command: `npm run build`
- Start Command: `npm start`

---

**Quelle est la configuration actuelle sur Render ?**
Vérifiez Settings → Root Directory, Build Command, Start Command
