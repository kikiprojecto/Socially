#!/usr/bin/env pwsh
# POIDH Bot - Windows PowerShell Startup Script
# Run two terminals with one command for easy startup

param(
    [switch]$Setup = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host @"
╔════════════════════════════════════════════╗
║  POIDH Bot Startup Script for PowerShell   ║
╚════════════════════════════════════════════╝

USAGE:
  .\startup.ps1              Start bot (requires ollama already running)
  .\startup.ps1 -Setup       Run setup wizard first
  .\startup.ps1 -Help        Show this help

DESCRIPTION:
  This script starts the POIDH bot. It does NOT start OLLAMA.
  You must start OLLAMA first in a separate terminal:
  
  PowerShell Terminal 1:
    ollama serve
  
  PowerShell Terminal 2:
    .\startup.ps1

REQUIREMENTS:
  - Node.js v18+
  - OLLAMA installed and running (ollama serve)
  - .env file configured
  - npm install completed

NEXT STEPS:
  1. Terminal 1: ollama serve
  2. Terminal 2: .\startup.ps1
  3. Monitor logs in logs/ directory

FOR MORE INFO:
  - Setup guide: SETUP_WITH_OLLAMA.md
  - Quick reference: QUICK_REFERENCE.md
  - Architecture: OLLAMA_INTEGRATION.md

"@
    exit 0
}

# Colors
$Success = "Green"
$Error = "Red"
$Info = "Cyan"
$Warning = "Yellow"

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor $Info
Write-Host "║   POIDH Autonomous Bot - Startup Script    ║" -ForegroundColor $Info
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor $Info
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor $Info
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor $Success
} else {
    Write-Host "✗ Node.js not found!" -ForegroundColor $Error
    Write-Host "Please install from: https://nodejs.org/" -ForegroundColor $Warning
    exit 1
}

# Check OLLAMA connection
Write-Host "Checking OLLAMA connection..." -ForegroundColor $Info
try {
    $response = curl -s http://localhost:11434/api/tags -ErrorAction Stop
    Write-Host "✓ OLLAMA running at http://localhost:11434" -ForegroundColor $Success
} catch {
    Write-Host "✗ Cannot connect to OLLAMA!" -ForegroundColor $Error
    Write-Host "Please start OLLAMA first:" -ForegroundColor $Warning
    Write-Host "  ollama serve" -ForegroundColor $Warning
    exit 1
}

# Check .env
Write-Host "Checking configuration..." -ForegroundColor $Info
if (Test-Path .env) {
    Write-Host "✓ .env file found" -ForegroundColor $Success
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor $Error
    Write-Host "Creating from template..." -ForegroundColor $Warning
    if (Test-Path poidh_env_example.sh) {
        Copy-Item poidh_env_example.sh .env
        Write-Host "✓ .env created (edit with your settings)" -ForegroundColor $Success
    } else {
        Write-Host "✗ Cannot find poidh_env_example.sh" -ForegroundColor $Error
        exit 1
    }
}

# Run setup if requested
if ($Setup) {
    Write-Host ""
    Write-Host "Running setup wizard..." -ForegroundColor $Info
    Write-Host ""
    npm run setup
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Setup failed!" -ForegroundColor $Error
        exit 1
    }
}

# Start the bot
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor $Success
Write-Host "║        Starting POIDH Bot...               ║" -ForegroundColor $Success
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor $Success
Write-Host ""

npm start
