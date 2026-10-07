@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM DeepSeek Desktop - Windows Development Launcher
REM Starts the app in development mode with hot reload
REM ============================================================

echo.
echo ============================================================
echo   DeepSeek Desktop - Development Mode (Windows)
echo ============================================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Dependencies not installed. Running installer...
    call install.bat
    if %errorlevel% neq 0 (
        echo [ERROR] Installation failed
        pause
        exit /b 1
    )
)

REM Check if renderer is built
if not exist "apps\desktop\renderer\dist\" (
    echo [INFO] Renderer not built. Building...
    cd apps\desktop
    pnpm --filter @deepseek/renderer build
    cd ..\..
)

REM Check if electron main is built
if not exist "apps\desktop\dist\electron\main.js" (
    echo [INFO] Electron main not built. Building...
    cd apps\desktop
    node scripts\build-main.mjs
    cd ..\..
)

echo.
echo [OK] All components ready
echo.

REM Start renderer dev server in background
echo [1/2] Starting renderer dev server...
cd apps\desktop\renderer
start "DeepSeek Renderer" cmd /c "pnpm dev"
cd ..\..

REM Wait for dev server
echo [INFO] Waiting for renderer to start...
timeout /t 3 /nobreak >nul

REM Start Electron with Vite dev server URL
echo [2/2] Starting Electron...
set VITE_DEV_SERVER_URL=http://localhost:5173
cd apps\desktop
pnpm dev
cd ..\..

echo.
echo [INFO] Application closed
pause
