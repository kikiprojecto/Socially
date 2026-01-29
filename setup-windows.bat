@echo off
REM POIDH Bot - Windows Setup Script
REM This script automates the OLLAMA + bot setup process

setlocal enabledelayedexpansion
cls

echo.
echo ============================================
echo   POIDH Autonomous Bot - Windows Setup
echo ============================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js not found!
    echo Please install Node.js v18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version
echo.

REM Check OLLAMA
echo Checking OLLAMA installation...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] OLLAMA not found!
    echo.
    echo Please install OLLAMA:
    echo 1. Download from https://ollama.ai/download
    echo 2. Run the Windows installer
    echo 3. Restart this script
    echo.
    pause
    exit /b 1
)
echo [OK] OLLAMA found: 
ollama --version
echo.

REM Check/create .env
echo Setting up environment configuration...
if exist .env (
    echo [OK] .env file exists
) else (
    echo Creating .env from template...
    if exist poidh_env_example.sh (
        copy poidh_env_example.sh .env >nul
        echo [OK] .env created from poidh_env_example.sh
    ) else (
        echo.
        echo [WARNING] poidh_env_example.sh not found!
        echo Please ensure you're in the bot directory
        echo.
        pause
        exit /b 1
    )
)
echo.

REM Install dependencies
echo Installing Node.js dependencies...
echo This may take a moment...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Verify OLLAMA connectivity
echo Verifying OLLAMA connectivity...
REM Note: curl might not be available on all Windows versions
REM This is a simple check - production code should handle this
echo [INFO] OLLAMA should be running on http://localhost:11434
echo.

REM Run setup wizard
echo.
echo ============================================
echo Running setup wizard...
echo ============================================
echo.
call npm run setup

if errorlevel 1 (
    echo.
    echo [ERROR] Setup wizard failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo SUCCESS! Setup complete!
echo ============================================
echo.
echo NEXT STEPS:
echo.
echo 1. Open a PowerShell window and run:
echo    ollama serve
echo.
echo 2. Open another PowerShell window and run:
echo    npm start
echo.
echo For more information, see SETUP_WITH_OLLAMA.md
echo.
pause
