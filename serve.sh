#!/usr/bin/env bash
# ============================================================================
# DeepSeek Desktop — Production Server (Linux / macOS)
# ============================================================================
# Builds the app and serves the optimized production build on localhost.
# Faster and smaller than the dev server — use this for daily use.
#
# Usage:
#   chmod +x serve.sh
#   ./serve.sh
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PORT="${PORT:-3000}"
HOST="localhost"
URL="http://${HOST}:${PORT}"

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║        DeepSeek Desktop — Production Server               ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ---------- Check dependencies ----------
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Running installer...${NC}"
    chmod +x ./install.sh
    ./install.sh
fi

# ---------- Build ----------
echo -e "${BLUE}Building optimized production bundle...${NC}"
npm run build --silent
echo -e "${GREEN}✓ Build complete.${NC}"
echo ""

# ---------- Serve ----------
echo -e "${BLUE}Starting production server...${NC}"
echo ""
echo -e "${GREEN}${BOLD}  App URL : ${URL}${NC}"
echo -e "${GREEN}${BOLD}  Press Ctrl+C to stop${NC}"
echo ""

# Open browser
(sleep 1 && {
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL" 2>/dev/null || true
    elif command -v open >/dev/null 2>&1; then
        open "$URL" 2>/dev/null || true
    fi
}) &

# Use Vite's built-in preview server (serves the production build)
PORT=$PORT npx vite preview --port "$PORT" --host 0.0.0.0
