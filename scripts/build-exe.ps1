#!/usr/bin/env pwsh
# ============================================================================
# DeepSeek Desktop - Windows Build Script (PowerShell)
# Generates .exe installer for Windows
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================"
Write-Host "  DeepSeek Desktop - Windows Build Script"
Write-Host "============================================================"
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js found: $nodeVersion"
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

# Check pnpm
try {
    $pnpmVersion = pnpm -v
    Write-Host "[OK] pnpm found: $pnpmVersion"
} catch {
    Write-Host "[INFO] pnpm not found, installing globally..."
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install pnpm" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host ""
Write-Host "[1/5] Installing dependencies..."
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Dependencies installed"

# Build all packages
Write-Host ""
Write-Host "[2/5] Building all packages..."
pnpm -r build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build packages" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Packages built"

# Build Electron main process
Write-Host ""
Write-Host "[3/5] Building Electron main process..."
Set-Location "apps\desktop"
node scripts\build-main.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build Electron main process" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Electron main process built"

# Build renderer
Write-Host ""
Write-Host "[4/5] Building renderer..."
pnpm --filter @deepseek/renderer build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build renderer" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Renderer built"

# Build Windows installer
Write-Host ""
Write-Host "[5/5] Building Windows installer (.exe)..."
pnpm exec electron-builder --config electron-builder.yml --win --x64
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to build Windows installer" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Windows installer built"

Write-Host ""
Write-Host "============================================================"
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "============================================================"
Write-Host ""
Write-Host "Output files are in: apps\desktop\release\"
Write-Host ""
Write-Host "To install:"
Write-Host "  1. Open the release folder"
Write-Host "  2. Run 'DeepSeek Desktop Setup *.exe'"
Write-Host "  3. Follow the installation wizard"
Write-Host ""
Write-Host "Or use the portable version:"
Write-Host "  deepseek-desktop-portable-*.exe"
Write-Host ""
