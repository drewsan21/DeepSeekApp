@echo off
setlocal enabledelayedexpansion

REM Build Verification Script for Windows
REM Verifies that all cross-platform builds are configured correctly

echo.
echo ========================================
echo   Verifying Cross-Platform Builds
echo ========================================
echo.

set PASS=0
set FAIL=0
set WARN=0

REM Function to check if file exists
:check_file
if exist "%~1" (
    echo [OK] %~2: %~1
    set /a PASS+=1
) else (
    echo [FAIL] %~2: %~1 (NOT FOUND)
    set /a FAIL+=1
)
goto :eof

REM Function to check if directory exists
:check_dir
if exist "%~1\" (
    echo [OK] %~2: %~1
    set /a PASS+=1
) else (
    echo [FAIL] %~2: %~1 (NOT FOUND)
    set /a FAIL+=1
)
goto :eof

REM Function to check if command exists
:check_command
where %~1 >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] %~2: %~1
    set /a PASS+=1
) else (
    echo [FAIL] %~2: %~1 (NOT FOUND)
    set /a FAIL+=1
)
goto :eof

echo Checking Build Dependencies...
echo.

call :check_command "node" "Node.js"
call :check_command "npm" "npm"
call :check_command "npx" "npx"

REM Check electron-builder
call npx electron-builder --version >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] electron-builder: installed
    set /a PASS+=1
) else (
    echo [FAIL] electron-builder: not installed
    set /a FAIL+=1
)

echo.
echo Checking Project Structure...
echo.

call :check_file "package.json" "package.json"
call :check_file "electron\main.js" "Electron main process"
call :check_file "electron\preload.js" "Electron preload script"
call :check_file "electron\ipc-handlers.js" "IPC handlers"
call :check_dir "src" "Source directory"
call :check_dir "dist" "Build output directory"

echo.
echo Checking Build Assets...
echo.

call :check_dir "build" "Build directory"
call :check_file "build\entitlements.mac.plist" "macOS entitlements"

if exist "build\icon.ico" (
    echo [OK] Windows icon: build\icon.ico
    set /a PASS+=1
) else (
    echo [WARN] Windows icon: build\icon.ico (not created yet)
    set /a WARN+=1
)

if exist "build\icon.png" (
    echo [OK] General icon: build\icon.png
    set /a PASS+=1
) else (
    echo [WARN] General icon: build\icon.png (not created yet)
    set /a WARN+=1
)

echo.
echo Checking Build Scripts...
echo.

call :check_file "scripts\build-windows.bat" "Windows build script"
call :check_file "scripts\build-linux.sh" "Linux build script"
call :check_file "scripts\build-macos.sh" "macOS build script"
call :check_file "scripts\convert-icons.bat" "Icon conversion script"
call :check_file "scripts\verify-builds.bat" "Build verification script"

echo.
echo Checking Build Configuration...
echo.

REM Check package.json build config
findstr /C:"\"electron-builder\"" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] electron-builder in package.json
    set /a PASS+=1
) else (
    echo [FAIL] electron-builder not in package.json
    set /a FAIL+=1
)

findstr /C:"\"build\":" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] Build configuration in package.json
    set /a PASS+=1
) else (
    echo [FAIL] Build configuration missing in package.json
    set /a FAIL+=1
)

REM Check for platform-specific configs
findstr /C:"\"win\":" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] Windows build configuration
    set /a PASS+=1
) else (
    echo [FAIL] Windows build configuration missing
    set /a FAIL+=1
)

findstr /C:"\"mac\":" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] macOS build configuration
    set /a PASS+=1
) else (
    echo [FAIL] macOS build configuration missing
    set /a FAIL+=1
)

findstr /C:"\"linux\":" package.json >nul
if %errorlevel% equ 0 (
    echo [OK] Linux build configuration
    set /a PASS+=1
) else (
    echo [FAIL] Linux build configuration missing
    set /a FAIL+=1
)

echo.
echo ========================================
echo   Build Verification Summary
echo ========================================
echo.
echo Passed:   %PASS%
echo Warnings: %WARN%
echo Failed:   %FAIL%
echo.

if %FAIL% equ 0 (
    echo [OK] All critical checks passed!
    echo.
    echo Ready to build:
    echo.
    echo   Windows:  scripts\build-windows.bat
    echo   Linux:    scripts\build-linux.sh
    echo   macOS:    scripts\build-macos.sh
    echo   All:      npm run electron:build
    echo.
    exit /b 0
) else (
    echo [FAIL] Some checks failed. Please fix the issues above.
    echo.
    exit /b 1
)

endlocal
