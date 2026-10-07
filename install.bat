@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM DeepSeek Desktop - Windows Installation Script
REM Generates .exe installer for Windows
REM ============================================================

echo.
echo ============================================================
echo   DeepSeek Desktop - Windows Installer Builder
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] pnpm not found, installing globally...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install pnpm
        pause
        exit /b 1
    )
)

echo [OK] pnpm found

REM Install dependencies
echo.
echo [1/5] Installing dependencies...
pnpm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed

REM Build all packages
echo.
echo [2/5] Building all packages...
pnpm -r build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build packages
    pause
    exit /b 1
)

echo [OK] Packages built

REM Build Electron main process
echo.
echo [3/5] Building Electron main process...
cd apps\desktop
node scripts\build-main.mjs
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Electron main process
    pause
    exit /b 1
)

echo [OK] Electron main process built

REM Build renderer
echo.
echo [4/5] Building renderer...
pnpm --filter @deepseek/renderer build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build renderer
    pause
    exit /b 1
)

echo [OK] Renderer built

REM Build Windows installer
echo.
echo [5/5] Building Windows installer (.exe)...
pnpm exec electron-builder --config electron-builder.yml --win --x64
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Windows installer
    pause
    exit /b 1
)

echo [OK] Windows installer built

echo.
echo ============================================================
echo   Build Complete!
echo ============================================================
echo.
echo Output files are in: apps\desktop\release\
echo.
echo To install:
echo   1. Open the release folder
echo   2. Run "DeepSeek Desktop Setup *.exe"
echo   3. Follow the installation wizard
echo.
echo Or use the portable version:
echo   deepseek-desktop-portable-*.exe
echo.
pause
