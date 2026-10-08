@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM DeepSeek Desktop - Windows Production Server
REM Builds and serves the production version
REM ============================================================

echo.
echo ============================================================
echo   DeepSeek Desktop - Production Mode (Windows)
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

REM Build for production
echo.
echo [1/2] Building for production...
cd apps\desktop
pnpm build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
cd ..\..
echo [OK] Build complete

REM Start Electron
echo.
echo [2/2] Starting application...
cd apps\desktop
pnpm dev
cd ..\..

echo.
echo [INFO] Application closed
pause
