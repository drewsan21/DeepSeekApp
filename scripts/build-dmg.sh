#!/usr/bin/env bash
# ============================================================================
# DeepSeek Desktop - macOS Build Script
# Generates .dmg installer for macOS
# ============================================================================

set -euo pipefail

echo ""
echo "============================================================"
echo "  DeepSeek Desktop - macOS Build Script"
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

# Build macOS package
echo ""
echo "[5/5] Building macOS package (.dmg)..."
pnpm exec electron-builder --config electron-builder.yml --mac --x64 --arm64
echo "[OK] macOS package built"

echo ""
echo "============================================================"
echo "  Build Complete!"
echo "============================================================"
echo ""
echo "Output files are in: apps/desktop/release/"
echo ""
echo "To install:"
echo "  1. Open the release folder"
echo "  2. Double-click 'DeepSeek Desktop-*.dmg'"
echo "  3. Drag the app to Applications folder"
echo ""
