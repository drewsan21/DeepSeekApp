#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# DeepSeek Desktop - Linux Installation Script
# Generates .deb installer for Debian/Ubuntu
# ============================================================

echo ""
echo "============================================================"
echo "  DeepSeek Desktop - Linux Installer Builder"
echo "============================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo ""
    echo "Please install Node.js (>= 18) from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[OK] Node.js found: $(node -v)"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo "[INFO] pnpm not found, installing globally..."
    npm install -g pnpm
fi

echo "[OK] pnpm found: $(pnpm -v)"

# Install dependencies
echo ""
echo "[1/5] Installing dependencies..."
pnpm install
echo "[OK] Dependencies installed"

# Build all packages
echo ""
echo "[2/5] Building all packages..."
pnpm -r build
echo "[OK] Packages built"

# Build Electron main process
echo ""
echo "[3/5] Building Electron main process..."
cd apps/desktop
node scripts/build-main.mjs
echo "[OK] Electron main process built"

# Build renderer
echo ""
echo "[4/5] Building renderer..."
pnpm --filter @deepseek/renderer build
echo "[OK] Renderer built"

# Build Debian package
echo ""
echo "[5/5] Building Debian package (.deb)..."
pnpm exec electron-builder --config electron-builder.yml --linux deb --x64 --arm64
echo "[OK] Debian package built"

echo ""
echo "============================================================"
echo "  Build Complete!"
echo "============================================================"
echo ""
echo "Output files are in: apps/desktop/release/"
echo ""
echo "To install on Debian/Ubuntu:"
echo "  sudo apt install ./apps/desktop/release/deepseek-desktop_*_amd64.deb"
echo ""
echo "To launch:"
echo "  deepseek-desktop"
echo ""
