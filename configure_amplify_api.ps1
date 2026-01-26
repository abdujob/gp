# Script pour configurer l'API backend dans Amplify
# Exécutez ce script dans PowerShell

# 1. Mettre à jour la variable d'environnement
aws amplify update-app `
    --app-id d2caxflzc9bgu5 `
    --environment-variables NEXT_PUBLIC_API_URL=https://gp-backend-skwd.onrender.com/api

# 2. Déclencher un nouveau build
aws amplify start-job `
    --app-id d2caxflzc9bgu5 `
    --branch-name main `
    --job-type RELEASE

Write-Host "✅ Configuration mise à jour !"
Write-Host "⏳ Le build va démarrer. Attendez 5-10 minutes."
Write-Host "🌐 Vérifiez ensuite sur https://gp.senecoins.com/"
