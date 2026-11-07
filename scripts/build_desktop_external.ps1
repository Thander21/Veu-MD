# scripts/build_desktop_external.ps1
# Executa o build de produção Desktop em uma janela independente do PowerShell
$ErrorActionPreference = "Continue"

Set-Location -Path "$PSScriptRoot\.."

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Veu MD — Build Desktop Externo (Tauri v2 + Rust)   " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$cargoBin = "$env:USERPROFILE\.cargo\bin"
if (Test-Path $cargoBin) {
    if ($env:Path -notlike "*$cargoBin*") {
        $env:Path = "$cargoBin;$env:Path"
    }
}

Write-Host "Executando: npm run tauri build..." -ForegroundColor Yellow
npm run tauri build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCESSO] Build concluido com sucesso!" -ForegroundColor Green
    Write-Host "Binarios gerados em: src-tauri\target\release\bundle\`n" -ForegroundColor Green
} else {
    Write-Host "`n[ERRO] Ocorreu uma falha durante o build (Exit Code: $LASTEXITCODE)." -ForegroundColor Red
}
