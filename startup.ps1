#!/usr/bin/env pwsh
# Socially Bot - Windows PowerShell Startup Script
# Run two terminals with one command for easy startup

param(
    [switch]$Setup = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host @"
╔════════════════════════════════════════════╗
║ Socially Bot Startup Script for PowerShell ║
╚════════════════════════════════════════════╝

USAGE:
  .\startup.ps1              Start bot
  .\startup.ps1 -Setup       Run setup wizard first
  .\startup.ps1 -Help        Show this help

DESCRIPTION:
  This script starts the Socially bot.

REQUIREMENTS:
  - Node.js v18+
  - .env file configured
  - npm install completed

NEXT STEPS:
  1. .\startup.ps1
  2. Monitor logs in logs/ directory

FOR MORE INFO:
  - See .env.example for configuration

"@
    exit 0
}

# Colors
$Success = "Green"
$Error = "Red"
$Info = "Cyan"
$Warning = "Yellow"

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor $Info
Write-Host "║  Socially Autonomous Bot - Startup Script  ║" -ForegroundColor $Info
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

# Check .env
Write-Host "Checking configuration..." -ForegroundColor $Info
if (Test-Path .env) {
    Write-Host "✓ .env file found" -ForegroundColor $Success
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor $Error
    Write-Host "Creating from template..." -ForegroundColor $Warning
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✓ .env created (edit with your settings)" -ForegroundColor $Success
    } else {
        Write-Host "✗ Cannot find .env.example" -ForegroundColor $Error
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
Write-Host "║       Starting Socially Bot...             ║" -ForegroundColor $Success
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor $Success
Write-Host ""

npm start
