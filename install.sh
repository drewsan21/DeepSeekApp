#!/usr/bin/env bash
# ============================================================================
# DeepSeek Desktop — Environment Installer (Linux / macOS)
# ============================================================================
# This script installs all project dependencies into the local project folder.
# It does NOT require root/sudo access and does not install global packages.
#
# Prerequisites:
#   - bash (standard on Linux/macOS)
#   - Node.js >= 18  (https://nodejs.org)
#   - npm >= 9       (ships with Node.js)
#
# Usage:
#   chmod +x install.sh
#   ./install.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Project root = directory containing this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${CYAN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║   DeepSeek Desktop — Environment Installer (Linux/macOS)  ║${NC}"
echo -e "${CYAN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ---------- Check Node.js ----------
echo -e "${BLUE}[1/4]${NC} Checking Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}✗ Node.js is not installed or not in PATH.${NC}"
    echo ""
    echo -e "${YELLOW}Install Node.js (>= 18) from one of these:${NC}"
    echo "  • Official installer : https://nodejs.org/"
    echo "  • nvm (recommended)  : https://github.com/nvm-sh/nvm"
    echo "  • Homebrew (macOS)   : brew install node"
    echo "  • APT (Debian/Ubuntu): sudo apt install nodejs npm"
    echo "  • DNF (Fedora)       : sudo dnf install nodejs npm"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 18 or newer is required (found ${NODE_VERSION}).${NC}"
    exit 1
fi

# ---------- Check npm ----------
echo -e "${BLUE}[2/4]${NC} Checking npm..."
if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}✗ npm is not installed.${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"

# ---------- Install dependencies ----------
echo -e "${BLUE}[3/4]${NC} Installing dependencies into ./node_modules ..."
echo ""

# Use a local cache inside the project to keep everything self-contained
export npm_config_cache="$SCRIPT_DIR/.npm-cache"
mkdir -p "$npm_config_cache"

# Install (production + dev) — everything goes into ./node_modules
if npm install --no-audit --no-fund --loglevel=error; then
    echo ""
    echo -e "${GREEN}✓ All dependencies installed successfully.${NC}"
else
    echo ""
    echo -e "${RED}✗ npm install failed. See errors above.${NC}"
    echo -e "${YELLOW}  Try: rm -rf node_modules .npm-cache && ./install.sh${NC}"
    exit 1
fi

# ---------- Summary ----------
echo -e "${BLUE}[4/4]${NC} Verifying installation..."
if [ ! -d "node_modules" ]; then
    echo -e "${RED}✗ node_modules directory not found after install.${NC}"
    exit 1
fi

DEP_COUNT=$(ls node_modules | wc -l | tr -d ' ')
echo -e "${GREEN}✓ ${DEP_COUNT} packages installed in ./node_modules${NC}"

echo ""
echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║                  Installation complete!                   ║${NC}"
echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Project folder : ${BOLD}${SCRIPT_DIR}${NC}"
echo -e "Node modules   : ${BOLD}${SCRIPT_DIR}/node_modules${NC}"
echo -e "npm cache      : ${BOLD}${SCRIPT_DIR}/.npm-cache${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Start the app   : ${BOLD}./start.sh${NC}"
echo -e "  2. Open in browser : ${BOLD}http://localhost:3000${NC}"
echo -e "  3. Build for prod  : ${BOLD}npm run build${NC}"
echo ""
echo -e "${YELLOW}Tip: All dependencies are contained in this project folder.${NC}"
echo -e "${YELLOW}     You can delete node_modules and re-run ./install.sh anytime.${NC}"
echo ""
