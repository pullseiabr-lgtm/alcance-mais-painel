# ═══════════════════════════════════════════════════════════════
# ALCANCE+ — Script de Instalação Automática para Windows
# Execute com: PowerShell -ExecutionPolicy Bypass -File instalar.ps1
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$ProjectPath = "C:\Users\$env:USERNAME\alcance+"

Write-Host ""
Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     ALCANCE+ — INSTALAÇÃO AUTOMÁTICA  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Função auxiliar ───────────────────────────────────────────
function Write-Step($msg) {
    Write-Host "▶ $msg" -ForegroundColor Yellow
}
function Write-OK($msg) {
    Write-Host "  ✅ $msg" -ForegroundColor Green
}
function Write-Fail($msg) {
    Write-Host "  ❌ $msg" -ForegroundColor Red
}

# ── PASSO 1: Verificar Node.js ────────────────────────────────
Write-Step "Verificando Node.js..."

$nodeInstalled = $false
try {
    $nodeVersion = & node --version 2>&1
    if ($nodeVersion -match "v(\d+)") {
        $major = [int]$Matches[1]
        if ($major -ge 18) {
            Write-OK "Node.js $nodeVersion encontrado"
            $nodeInstalled = $true
        } else {
            Write-Fail "Node.js $nodeVersion é antigo. Precisa da versão 18+"
        }
    }
} catch {
    Write-Fail "Node.js não encontrado"
}

if (-not $nodeInstalled) {
    Write-Host ""
    Write-Host "  ⚠️  Node.js não está instalado ou não está no PATH." -ForegroundColor Red
    Write-Host "  Baixe em: https://nodejs.org (clique em LTS)" -ForegroundColor White
    Write-Host "  Após instalar, feche este terminal e execute o script novamente." -ForegroundColor White
    Write-Host ""
    Read-Host "Pressione ENTER para sair"
    exit 1
}

# ── PASSO 2: Verificar se o projeto existe ────────────────────
Write-Step "Verificando projeto Alcance+..."

if (-not (Test-Path $ProjectPath)) {
    Write-Fail "Pasta do projeto não encontrada em: $ProjectPath"
    Write-Host "  Certifique-se que o projeto está em C:\Users\$env:USERNAME\alcance+" -ForegroundColor White
    Read-Host "Pressione ENTER para sair"
    exit 1
}

Write-OK "Projeto encontrado em $ProjectPath"

# ── PASSO 3: Instalar dependências ────────────────────────────
Write-Step "Instalando dependências (npm install)..."
Write-Host "  Isso pode demorar alguns minutos na primeira vez..." -ForegroundColor Gray

Set-Location $ProjectPath

try {
    & npm install --legacy-peer-deps 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-OK "Dependências instaladas com sucesso"
} catch {
    Write-Fail "Erro ao instalar dependências: $_"
    Read-Host "Pressione ENTER para sair"
    exit 1
}

# ── PASSO 4: Verificar/Criar .env.local ──────────────────────
Write-Step "Verificando arquivo .env.local..."

$envPath = Join-Path $ProjectPath ".env.local"

if (-not (Test-Path $envPath)) {
    Write-Host "  Arquivo .env.local não encontrado. Criando modelo..." -ForegroundColor Yellow

    $envContent = @"
# ── Supabase (OBRIGATÓRIO) ─────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=cole_aqui_sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui_sua_chave_anon

# ── Anthropic / Claude IA (OBRIGATÓRIO para os agentes IA) ────
ANTHROPIC_API_KEY=cole_aqui_sua_chave_sk-ant-...

# ── Meta Ads (opcional) ────────────────────────────────────────
META_ADS_ACCESS_TOKEN=

# ── Google Ads (opcional) ─────────────────────────────────────
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_MANAGER_ACCOUNT_ID=

# ── TikTok Ads (opcional) ─────────────────────────────────────
TIKTOK_ADS_ACCESS_TOKEN=

# ── WhatsApp - Evolution API (opcional) ───────────────────────
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=cole_aqui_sua_apikey_da_evolution
EVOLUTION_INSTANCE_NAME=alcance
"@

    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Write-Host ""
    Write-Host "  ⚠️  ATENÇÃO: Arquivo .env.local criado com valores de exemplo." -ForegroundColor Red
    Write-Host "  Você PRECISA editar o arquivo antes de rodar o sistema:" -ForegroundColor Red
    Write-Host "  $envPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Obrigatório preencher:" -ForegroundColor Yellow
    Write-Host "  1. NEXT_PUBLIC_SUPABASE_URL    → supabase.com → seu projeto → Settings → API" -ForegroundColor White
    Write-Host "  2. NEXT_PUBLIC_SUPABASE_ANON_KEY → mesmo lugar" -ForegroundColor White
    Write-Host "  3. ANTHROPIC_API_KEY            → console.anthropic.com → API Keys" -ForegroundColor White
    Write-Host ""

    $openFile = Read-Host "Deseja abrir o arquivo .env.local agora para editar? (S/N)"
    if ($openFile -eq "S" -or $openFile -eq "s") {
        Start-Process notepad.exe $envPath
        Write-Host ""
        Write-Host "  Edite o arquivo, salve e pressione ENTER para continuar..." -ForegroundColor Yellow
        Read-Host
    }
} else {
    Write-OK ".env.local já existe"

    # Verificar se as chaves obrigatórias foram preenchidas
    $envContent = Get-Content $envPath -Raw
    $missingKeys = @()

    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=cole_") { $missingKeys += "NEXT_PUBLIC_SUPABASE_URL" }
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_") { $missingKeys += "NEXT_PUBLIC_SUPABASE_ANON_KEY" }
    if ($envContent -match "ANTHROPIC_API_KEY=cole_") { $missingKeys += "ANTHROPIC_API_KEY" }

    if ($missingKeys.Count -gt 0) {
        Write-Host ""
        Write-Host "  ⚠️  As seguintes chaves ainda não foram configuradas:" -ForegroundColor Red
        foreach ($key in $missingKeys) {
            Write-Host "     • $key" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# ── PASSO 5: Criar atalho na Área de Trabalho ─────────────────
Write-Step "Criando atalho na Área de Trabalho..."

try {
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "Alcance+.lnk"

    $batchContent = @"
@echo off
title Alcance+ — Sistema de Marketing
cd /d "$ProjectPath"
echo Iniciando Alcance+...
npm run dev
pause
"@

    $batchPath = Join-Path $ProjectPath "iniciar.bat"
    Set-Content -Path $batchPath -Value $batchContent -Encoding UTF8

    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = $batchPath
    $Shortcut.WorkingDirectory = $ProjectPath
    $Shortcut.Description = "Iniciar Alcance+ Sistema de Marketing"
    $Shortcut.Save()

    Write-OK "Atalho criado na Área de Trabalho"
} catch {
    Write-Host "  ⚠️  Não foi possível criar o atalho: $_" -ForegroundColor Yellow
}

# ── PASSO 6: Rodar o servidor ─────────────────────────────────
Write-Host ""
Write-Host "╔═══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        INSTALAÇÃO CONCLUÍDA!          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Para usar o sistema:" -ForegroundColor White
Write-Host "  1. Certifique-se que .env.local está preenchido" -ForegroundColor Gray
Write-Host "  2. Abra o atalho 'Alcance+' na Área de Trabalho" -ForegroundColor Gray
Write-Host "     OU execute: npm run dev na pasta $ProjectPath" -ForegroundColor Gray
Write-Host "  3. Acesse: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Deseja iniciar o Alcance+ agora? (S/N)"
if ($startNow -eq "S" -or $startNow -eq "s") {
    Write-Host ""
    Write-Host "  Iniciando servidor..." -ForegroundColor Green
    Write-Host "  Acesse: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  Para parar: pressione Ctrl+C" -ForegroundColor Gray
    Write-Host ""
    & npm run dev
}
