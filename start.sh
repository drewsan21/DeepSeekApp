#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# DeepSeek Desktop - Linux Development Launcher
# Starts the app in development mode with hot reload
# ============================================================

echo ""
echo "============================================================"
echo "  DeepSeek Desktop - Development Mode (Linux)"
echo "============================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[INFO] Dependencies not installed. Running installer..."
    chmod +x install.sh
    ./install.sh
fi

# Check if renderer is built
if [ ! -d "apps/desktop/renderer/dist" ]; then
    echo "[INFO] Renderer not built. Building..."
    cd apps/desktop
    pnpm --filter @deepseek/renderer build
    cd ../..
fi

# Check if electron main is built
if [ ! -f "apps/desktop/dist/electron/main.js" ]; then
    echo "[INFO] Electron main not built. Building..."
    cd apps/desktop
    node scripts/build-main.mjs
    cd ../..
fi

echo ""
echo "[OK] All components ready"
echo ""

# Start renderer dev server in background
echo "[1/2] Starting renderer dev server..."
cd apps/desktop/renderer
pnpm dev &
RENDERER_PID=$!
cd ../../..

# Wait for dev server
echo "[INFO] Waiting for renderer to start..."
sleep 3

# Start Electron with Vite dev server URL
echo "[2/2] Starting Electron..."
export VITE_DEV_SERVER_URL=http://localhost:5173
cd apps/desktop
pnpm dev
cd ../..

# Cleanup
kill $RENDERER_PID 2>/dev/null || true

echo ""
echo "[INFO] Application closed"
