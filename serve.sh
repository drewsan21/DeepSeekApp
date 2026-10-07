#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# DeepSeek Desktop - Linux Production Server
# Builds and serves the production version
# ============================================================

echo ""
echo "============================================================"
echo "  DeepSeek Desktop - Production Mode (Linux)"
echo "============================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[INFO] Dependencies not installed. Running installer..."
    chmod +x install.sh
    ./install.sh
fi

# Build for production
echo ""
echo "[1/2] Building for production..."
cd apps/desktop
pnpm build
cd ../..
echo "[OK] Build complete"

# Start Electron
echo ""
echo "[2/2] Starting application..."
cd apps/desktop
pnpm dev
cd ../..

echo ""
echo "[INFO] Application closed"
