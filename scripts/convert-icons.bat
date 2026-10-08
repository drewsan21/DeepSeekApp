@echo off
setlocal enabledelayedexpansion

REM Icon Conversion Script for Windows
REM Converts SVG icon to Windows ICO format

echo.
echo ========================================
echo   Converting Icons for Windows
echo ========================================
echo.

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %errorlevel% neq 0 (
    where convert >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] ImageMagick is not installed
        echo.
        echo Please install ImageMagick from:
        echo https://imagemagick.org/script/download.php
        echo.
        echo Or install via Chocolatey:
        echo choco install imagemagick
        echo.
        exit /b 1
    )
    set CONVERT_CMD=convert
) else (
    set CONVERT_CMD=magick
)

echo [OK] ImageMagick found: %CONVERT_CMD%
echo.

REM Create build directories
if not exist "build" mkdir build
if not exist "build\icons" mkdir build\icons

echo [1/3] Creating PNG icons...

REM Convert SVG to PNG (multiple sizes)
%CONVERT_CMD% public\icon.svg -resize 16x16 build\icons\icon-16x16.png
if %errorlevel% neq 0 goto :error
%CONVERT_CMD% public\icon.svg -resize 32x32 build\icons\icon-32x32.png
if %errorlevel% neq 0 goto :error
%CONVERT_CMD% public\icon.svg -resize 48x48 build\icons\icon-48x48.png
if %errorlevel% neq 0 goto :error
%CONVERT_CMD% public\icon.svg -resize 64x64 build\icons\icon-64x64.png
if %errorlevel% neq 0 goto :error
%CONVERT_CMD% public\icon.svg -resize 128x128 build\icons\icon-128x128.png
if %errorlevel% neq 0 goto :error
%CONVERT_CMD% public\icon.svg -resize 256x256 build\icons\icon-256x256.png
if %errorlevel% neq 0 goto :error

echo [OK] PNG icons created
echo.

echo [2/3] Creating Windows ICO file...

REM Create Windows ICO file with multiple sizes
%CONVERT_CMD% build\icons\icon-16x16.png ^
              build\icons\icon-32x32.png ^
              build\icons\icon-48x48.png ^
              build\icons\icon-64x64.png ^
              build\icons\icon-128x128.png ^
              build\icons\icon-256x256.png ^
              build\icon.ico

if %errorlevel% neq 0 goto :error

echo [OK] Windows ICO file created
echo.

echo [3/3] Copying main icon...

REM Copy main icon to build root
copy build\icons\icon-256x256.png build\icon.png >nul

echo [OK] Main icon copied
echo.

echo ========================================
echo   Icon Conversion Complete
echo ========================================
echo.
echo Created files:
echo   - build\icon.ico (Windows)
echo   - build\icon.png (General)
echo   - build\icons\ (PNG files)
echo.

exit /b 0

:error
echo.
echo [ERROR] Icon conversion failed
exit /b 1

endlocal
