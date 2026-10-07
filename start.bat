@echo off
setlocal EnableDelayedExpansion
REM ============================================================================
REM DeepSeek Desktop — Start Script (Windows)
REM ============================================================================
REM Starts the Vite dev server on localhost. Opens the browser automatically.
REM
REM Prerequisites:
REM   - Run install.bat first to install dependencies
REM
REM Usage:
REM   Double-click start.bat  OR  run from Command Prompt
REM
REM The app will be available at: http://localhost:3000
REM ============================================================================

title DeepSeek Desktop — Dev Server

REM Change to script directory
cd /d "%~dp0"

REM Default port (can be overridden by setting PORT env var before running)
if "%PORT%"=="" set PORT=3000
set HOST=localhost
set URL=http://%HOST%:%PORT%

echo.
echo ================================================================
echo          DeepSeek Desktop — Development Server
echo ================================================================
echo.

REM ---------- Check dependencies ----------
if not exist "node_modules\" (
    echo [WARN] node_modules not found.
    echo        Running installer first...
    echo.
    if exist "install.bat" (
        call install.bat
    ) else (
        echo [ERROR] install.bat not found. Cannot install dependencies.
        pause
        exit /b 1
    )
)

REM ---------- Check if port is in use ----------
:check_port
netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [WARN] Port %PORT% is already in use.
    set /a PORT+=1
    set URL=http://%HOST%:%PORT%
    goto check_port
)

REM ---------- Start server ----------
echo Starting Vite dev server...
echo.
echo   App URL : %URL%
echo   Press Ctrl+C to stop
echo.

REM Open browser after a short delay (in background)
start "" cmd /c "timeout /t 2 /nobreak >nul && start %URL%"

REM Start Vite (this blocks until Ctrl+C)
set PORT=%PORT%
call npm run dev -- --host 0.0.0.0 --port %PORT%

echo.
echo Server stopped.
pause
