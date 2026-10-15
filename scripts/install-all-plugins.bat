@echo off
REM Plugin Installation Script for DeepSeek Desktop (Windows)
REM This script installs all 8 integrated plugins

echo.
echo ====================================
echo   DeepSeek Desktop Plugin Installer
echo ====================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed
    echo Please install Node.js and npm first: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: git is not installed
    echo Please install git first: https://git-scm.com/
    pause
    exit /b 1
)

echo System check passed [OK]
echo.

echo Starting plugin installation...
echo.

REM 1. OpenDesign
echo Installing OpenDesign...
echo Repository: https://github.com/nexu-io/open-design
call npm install -g @open-design/cli
if %ERRORLEVEL% EQU 0 (
    echo [OK] OpenDesign installed successfully
) else (
    echo [FAIL] Failed to install OpenDesign
)
echo.

REM 2. Archify
echo Installing Archify...
echo Repository: https://github.com/tt-a1i/archify
call npm install -g archify
if %ERRORLEVEL% EQU 0 (
    echo [OK] Archify installed successfully
) else (
    echo [FAIL] Failed to install Archify
)
echo.

REM 3. Ruflo
echo Installing Ruflo...
echo Repository: https://github.com/ruvnet/ruflo
call npm install -g ruflo
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ruflo installed successfully
) else (
    echo [FAIL] Failed to install Ruflo
)
echo.

REM 4. OpenViking
echo Installing OpenViking...
echo Repository: https://github.com/volcengine/OpenViking
call npm install -g @volcengine/openviking
if %ERRORLEVEL% EQU 0 (
    echo [OK] OpenViking installed successfully
) else (
    echo [FAIL] Failed to install OpenViking
)
echo.

REM 5. DeepSeek-Reasonix
echo Installing DeepSeek-Reasonix...
echo Repository: https://github.com/esengine/DeepSeek-Reasonix
call npm install -g deepseek-reasonix
if %ERRORLEVEL% EQU 0 (
    echo [OK] DeepSeek-Reasonix installed successfully
) else (
    echo [FAIL] Failed to install DeepSeek-Reasonix
)
echo.

REM 6. DSH Desktop
echo Installing DSH Desktop...
echo Repository: https://github.com/anywhere-labs/dsh-desktop
call npm install -g @anywhere-labs/dsh-desktop
if %ERRORLEVEL% EQU 0 (
    echo [OK] DSH Desktop installed successfully
) else (
    echo [FAIL] Failed to install DSH Desktop
)
echo.

REM 7. NocoBase
echo Installing NocoBase...
echo Repository: https://github.com/nocobase/nocobase
call npm install -g nocobase
if %ERRORLEVEL% EQU 0 (
    echo [OK] NocoBase installed successfully
) else (
    echo [FAIL] Failed to install NocoBase
)
echo.

REM 8. DSH Free Model
echo Installing DSH Free Model...
echo Repository: https://github.com/Ebony-Vinyl/dsh-our-free-model
call npm install -g dsh-free-model
if %ERRORLEVEL% EQU 0 (
    echo [OK] DSH Free Model installed successfully
) else (
    echo [FAIL] Failed to install DSH Free Model
)
echo.

echo ====================================
echo   Installation Complete
echo ====================================
echo.
echo You can now manage these plugins from the DeepSeek Desktop application.
echo Open the app and navigate to the 'Plugins' section.
echo.
echo To verify installations, run:
echo   npm list -g --depth=0
echo.
pause
