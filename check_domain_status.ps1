# Script de vérification du statut du domaine gp.senecoins.com
# Date: 24 janvier 2026

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vérification du Domaine gp.senecoins.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérification DNS - Domaine Principal
Write-Host "1. DNS du domaine principal:" -ForegroundColor Yellow
Write-Host "   Commande: nslookup gp.senecoins.com" -ForegroundColor Gray
Write-Host ""
nslookup gp.senecoins.com
Write-Host ""

# 2. Vérification CNAME
Write-Host "2. Vérification CNAME:" -ForegroundColor Yellow
Write-Host "   Commande: nslookup -type=CNAME gp.senecoins.com" -ForegroundColor Gray
Write-Host ""
nslookup -type=CNAME gp.senecoins.com
Write-Host ""

# 3. Vérification DNS - Enregistrement SSL
Write-Host "3. DNS de vérification SSL:" -ForegroundColor Yellow
Write-Host "   Commande: nslookup _178974b9923d5a5b367aa73fa6839572.gp.senecoins.com" -ForegroundColor Gray
Write-Host ""
nslookup _178974b9923d5a5b367aa73fa6839572.gp.senecoins.com
Write-Host ""

# 4. Statut AWS Amplify
Write-Host "4. Statut AWS Amplify:" -ForegroundColor Yellow
Write-Host "   Commande: aws amplify get-domain-association" -ForegroundColor Gray
Write-Host ""

try {
    $result = aws amplify get-domain-association --app-id d2caxflzc9bgu5 --domain-name gp.senecoins.com --output json | ConvertFrom-Json
    
    Write-Host "   Statut du domaine: " -NoNewline
    if ($result.domainAssociation.domainStatus -eq "AVAILABLE") {
        Write-Host $result.domainAssociation.domainStatus -ForegroundColor Green
    } else {
        Write-Host $result.domainAssociation.domainStatus -ForegroundColor Red
    }
    
    Write-Host "   Sous-domaine vérifié: " -NoNewline
    if ($result.domainAssociation.subDomains[0].verified -eq $true) {
        Write-Host "OUI ✓" -ForegroundColor Green
    } else {
        Write-Host "NON ✗" -ForegroundColor Red
    }
    
    Write-Host "   Enregistrement DNS requis: " -ForegroundColor Cyan
    Write-Host "   $($result.domainAssociation.subDomains[0].dnsRecord)" -ForegroundColor White
    
} catch {
    Write-Host "   Erreur lors de la récupération du statut AWS" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Résumé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Si gp.senecoins.com pointe vers d3dtlgsqty6s6m.cloudfront.net → DNS OK" -ForegroundColor Green
Write-Host "✗ Si gp.senecoins.com pointe vers 109.234.166.94 → DNS pas encore propagé" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour plus d'informations, consultez:" -ForegroundColor Cyan
Write-Host "- guide_configuration_dns_o2switch.md" -ForegroundColor White
Write-Host "- domain_diagnostic.md" -ForegroundColor White
Write-Host ""
