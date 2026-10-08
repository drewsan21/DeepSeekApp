@echo off
setlocal enabledelayedexpansion

REM Windows Build Script for DeepSeek Desktop
REM Builds the application for Windows platform

echo.
echo ========================================
echo   DeepSeek Desktop - Windows Build
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo [OK] Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)

echo [OK] npm found
npm --version
echo.

REM Step 1: Install dependencies
echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 2: Convert icons
echo [2/5] Converting icons...
if exist "scripts\convert-icons.bat" (
    call scripts\convert-icons.bat
) else (
    echo [WARN] Icon conversion script not found, using existing icons
)
echo.

REM Step 3: Build the app
echo [3/5] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    exit /b 1
)
echo [OK] Application built
echo.

REM Step 4: Build Windows packages
echo [4/5] Building Windows packages...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Windows packages
    exit /b 1
)
echo [OK] Windows packages built
echo.

REM Step 5: Verify outputs
echo [5/5] Verifying outputs...
if not exist "release" (
    echo [ERROR] Release directory not found
    exit /b 1
)

echo [OK] Release directory exists
echo.

REM Check for NSIS installer
dir /b release\*.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] NSIS installer found:
    dir /b release\*.exe
) else (
    echo [WARN] NSIS installer not found
)

REM Check for portable version
dir /b release\*portable*.exe >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Portable version found:
    dir /b release\*portable*.exe
) else (
    echo [INFO] Portable version may be included in NSIS installer
)

echo.
echo ========================================
echo   Build Summary
echo ========================================
echo   Output directory: release\
echo.

REM Show directory size
for /f "tokens=*" %%a in ('dir /s release ^| findstr "File(s)"') do (
    echo   %%a
)

echo.
echo [OK] Windows build complete!
echo.
echo To install:
echo   1. Open the release folder
echo   2. Run 'DeepSeek-Desktop-Setup-*.exe'
echo   3. Follow the installation wizard
echo.

endlocal
