@echo off
setlocal EnableDelayedExpansion
REM ============================================================================
REM DeepSeek Desktop — Environment Installer (Windows)
REM ============================================================================
REM This script installs all project dependencies into the local project folder.
REM It does NOT require Administrator access and does not install global packages.
REM
REM Prerequisites:
REM   - Node.js >= 18  (https://nodejs.org)
REM   - npm >= 9       (ships with Node.js)
REM
REM Usage:
REM   Double-click install.bat  OR  run from Command Prompt
REM ============================================================================

title DeepSeek Desktop — Installer

echo.
echo ================================================================
echo    DeepSeek Desktop — Environment Installer (Windows)
echo ================================================================
echo.

REM ---------- Change to script directory ----------
cd /d "%~dp0"
set "PROJECT_DIR=%CD%"

REM ---------- Check Node.js ----------
echo [1/4] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Node.js is not installed or not in PATH.
    echo.
    echo Install Node.js (>= 18^) from one of these:
    echo   - Official installer : https://nodejs.org/
    echo   - wing               : winget install OpenJS.NodeJS.LTS
    echo   - Chocolatey         : choco install nodejs-lts
    echo   - Scoop              : scoop install nodejs-lts
    echo.
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%a in ('node -v') do set "NODE_RAW=%%a"
for /f "tokens=1 delims=v" %%a in ('node -v') do set "NODE_VERSION=%%a"
for /f "tokens=1 delims=." %%a in ('node -v') do set "NODE_MAJOR=%%a"

REM Strip leading 'v' from version
set NODE_VERSION=!NODE_VERSION:v=!
set NODE_MAJOR=!NODE_MAJOR:v=!

echo   [OK] Node.js %NODE_VERSION%

if !NODE_MAJOR! LSS 18 (
    echo.
    echo [ERROR] Node.js 18 or newer is required ^(found %NODE_VERSION%^).
    pause
    exit /b 1
)

REM ---------- Check npm ----------
echo [2/4] Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] npm is not installed.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do set "NPM_VERSION=%%v"
echo   [OK] npm %NPM_VERSION%

REM ---------- Install dependencies ----------
echo [3/4] Installing dependencies into .\node_modules ...
echo.

REM Use a local cache inside the project to keep everything self-contained
set "npm_config_cache=%PROJECT_DIR%\.npm-cache"
if not exist "%PROJECT_DIR%\.npm-cache" mkdir "%PROJECT_DIR%\.npm-cache"

call npm install --no-audit --no-fund --loglevel=error
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] npm install failed. See errors above.
    echo   Try: rmdir /s /q node_modules .npm-cache  then re-run install.bat
    pause
    exit /b 1
)

echo.
echo   [OK] All dependencies installed successfully.

REM ---------- Summary ----------
echo [4/4] Verifying installation...
if not exist "node_modules" (
    echo.
    echo [ERROR] node_modules directory not found after install.
    pause
    exit /b 1
)

echo   [OK] node_modules directory present.

echo.
echo ================================================================
echo                     Installation complete!
echo ================================================================
echo.
echo Project folder : %PROJECT_DIR%
echo Node modules   : %PROJECT_DIR%\node_modules
echo npm cache      : %PROJECT_DIR%\.npm-cache
echo.
echo Next steps:
echo   1. Start the app   : start.bat
echo   2. Open in browser : http://localhost:3000
echo   3. Build for prod  : npm run build
echo.
echo Tip: All dependencies are contained in this project folder.
echo      You can delete node_modules and re-run install.bat anytime.
echo.
pause
