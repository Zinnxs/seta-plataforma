# =========================================================================
# SCRIPT DE BACKUP SUPABASE -> GOOGLE DRIVE (PORTAL SETA)
# Executa o dump do banco e envia diretamente para a pasta oficial do Drive
# =========================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$rootDir = Split-Path -Parent $scriptDir
Set-Location $rootDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   BACKUP DO BANCO SUPABASE -> GOOGLE DRIVE (PORTAL SETA) " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Executa o script Node.js de extração do Supabase
Write-Host "`n[1/3] Extraindo tabelas e dados do Supabase..." -ForegroundColor Green
node "$scriptDir\backup-supabase.js"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha na extração do banco. Verifique as credenciais no .env." -ForegroundColor Red
    exit 1
}

# 2. Localiza o backup mais recente gerado
$latestSql = Get-ChildItem -Path "$rootDir\backups\backup_seta_*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$latestJson = Get-ChildItem -Path "$rootDir\backups\backup_seta_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if (-not $latestSql) {
    Write-Host "❌ Nenhum arquivo de backup encontrado na pasta 'backups/'." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/3] Arquivos de backup localizados:" -ForegroundColor Green
Write-Host "   SQL:  $($latestSql.FullName)" -ForegroundColor Gray
Write-Host "   JSON: $($latestJson.FullName)" -ForegroundColor Gray

# 3. Envia para o Google Drive
# ID da pasta '02_Banco_de_Dados_Supabase' no Google Drive do SETA
$driveFolderId = "1EzSi1xvv-UyhHTsrn3N4JqXzpNJ1LoIr"

Write-Host "`n[3/3] Enviando para o Google Drive (Pasta: 02_Banco_de_Dados_Supabase)..." -ForegroundColor Green

# Tenta usar o gdrive CLI se disponível
$gdriveCmd = Get-Command "gdrive" -ErrorAction SilentlyContinue

if ($gdriveCmd) {
    Write-Host "   Enviando arquivo SQL..." -ForegroundColor Cyan
    gdrive mutate upload "$($latestSql.FullName)" --parent $driveFolderId
    
    Write-Host "   Enviando arquivo JSON..." -ForegroundColor Cyan
    gdrive mutate upload "$($latestJson.FullName)" --parent $driveFolderId
    
    Write-Host "`n✅ BACKUP CONCLUÍDO COM SUCESSO NO GOOGLE DRIVE!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ O CLI 'gdrive' não está no PATH global." -ForegroundColor Yellow
    Write-Host "   Os arquivos de backup foram gerados com sucesso na pasta local: $rootDir\backups" -ForegroundColor Cyan
    Write-Host "   Você também pode usar o Rclone ou fazer o upload manual pela interface do Google Drive." -ForegroundColor Gray
}

Write-Host "==========================================================`n" -ForegroundColor Cyan
