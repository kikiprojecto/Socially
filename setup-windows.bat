@echo off
REM Socially Bot - Windows Setup Script
REM This script automates the Socially bot setup process

setlocal enabledelayedexpansion
cls

echo.
echo ============================================
echo   Socially Autonomous Bot - Windows Setup
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

REM Check/create .env
echo Setting up environment configuration...
if exist .env (
    echo [OK] .env file exists
) else (
    echo Creating .env from template...
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK] .env created from .env.example
    ) else (
        echo.
        echo [WARNING] .env.example not found!
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
echo 1. Edit .env with your settings
echo.
echo 2. Run:
echo    npm start
echo.
echo See .env.example for all available configuration
echo.
pause
