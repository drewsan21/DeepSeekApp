@echo off
setlocal EnableDelayedExpansion
REM ============================================================================
REM DeepSeek Desktop — Production Server (Windows)
REM ============================================================================
REM Builds the app and serves the optimized production build on localhost.
REM Faster and smaller than the dev server — use this for daily use.
REM
REM Usage:
REM   Double-click serve.bat  OR  run from Command Prompt
REM ============================================================================

title DeepSeek Desktop — Production Server

cd /d "%~dp0"

if "%PORT%"=="" set PORT=3000
set HOST=localhost
set URL=http://%HOST%:%PORT%

echo.
echo ================================================================
echo        DeepSeek Desktop — Production Server
echo ================================================================
echo.

REM ---------- Check dependencies ----------
if not exist "node_modules\" (
    echo [WARN] node_modules not found. Running installer...
    call install.bat
)

REM ---------- Build ----------
echo Building optimized production bundle...
call npm run build --silent
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)
echo   [OK] Build complete.
echo.

REM ---------- Serve ----------
echo Starting production server...
echo.
echo   App URL : %URL%
echo   Press Ctrl+C to stop
echo.

REM Open browser after a short delay
start "" cmd /c "timeout /t 1 /nobreak >nul && start %URL%"

REM Use Vite's built-in preview server
set PORT=%PORT%
call npx vite preview --port %PORT% --host 0.0.0.0

echo.
echo Server stopped.
pause
