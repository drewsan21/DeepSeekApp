#!/usr/bin/env bash
# ============================================================================
# DeepSeek Desktop — Start Script (Linux / macOS)
# ============================================================================
# Starts the Vite dev server on localhost. Opens the browser automatically.
#
# Prerequisites:
#   - Run ./install.sh first to install dependencies
#
# Usage:
#   chmod +x start.sh
#   ./start.sh
#
# The app will be available at: http://localhost:3000
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default port (can be overridden with PORT env var)
PORT="${PORT:-3000}"
HOST="localhost"
URL="http://${HOST}:${PORT}"

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║          DeepSeek Desktop — Development Server            ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ---------- Check dependencies ----------
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found.${NC}"
    echo -e "${YELLOW}  Running installer first...${NC}"
    echo ""
    if [ -f "./install.sh" ]; then
        chmod +x ./install.sh
        ./install.sh
    else
        echo -e "${RED}✗ install.sh not found. Cannot install dependencies.${NC}"
        exit 1
    fi
fi

# ---------- Check if port is in use ----------
check_port() {
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i :"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
            return 0  # port in use
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -an | grep -E ":${PORT}.*LISTEN" >/dev/null 2>&1; then
            return 0
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -ltn | grep -q ":${PORT} " 2>/dev/null; then
            return 0
        fi
    fi
    return 1  # port free
}

if check_port; then
    echo -e "${YELLOW}⚠ Port ${PORT} is already in use.${NC}"
    echo -e "${YELLOW}  Trying alternative port...${NC}"
    PORT=$((PORT + 1))
    URL="http://${HOST}:${PORT}"
    if check_port; then
        echo -e "${RED}✗ Could not find a free port.${NC}"
        echo -e "${YELLOW}  Close the other process or set PORT env var: PORT=4000 ./start.sh${NC}"
        exit 1
    fi
fi

# ---------- Start server ----------
echo -e "${BLUE}Starting Vite dev server...${NC}"
echo ""
echo -e "${GREEN}${BOLD}  App URL : ${URL}${NC}"
echo -e "${GREEN}${BOLD}  Press Ctrl+C to stop${NC}"
echo ""

# Try to open browser in background (non-blocking)
(sleep 2 && {
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$URL" 2>/dev/null || true
    elif command -v open >/dev/null 2>&1; then
        open "$URL" 2>/dev/null || true
    fi
}) &
BROWSER_PID=$!

# Start Vite
PORT=$PORT npm run dev -- --host 0.0.0.0 --port "$PORT" &
SERVER_PID=$!

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${BLUE}Shutting down...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    kill $BROWSER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Server stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for server
wait $SERVER_PID
