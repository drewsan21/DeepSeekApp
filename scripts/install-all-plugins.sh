#!/bin/bash

# Plugin Installation Scripts for DeepSeek Desktop
# This script installs all 8 integrated plugins

set -e

echo "🚀 DeepSeek Desktop Plugin Installer"
echo "===================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    echo "Please install Node.js and npm first: https://nodejs.org/"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    echo "Please install git first"
    exit 1
fi

echo -e "${BLUE}System check passed ✓${NC}"
echo ""

# Function to install a plugin
install_plugin() {
    local name=$1
    local command=$2
    local repo=$3
    
    echo -e "${YELLOW}Installing ${name}...${NC}"
    echo "Repository: ${repo}"
    echo "Command: ${command}"
    
    if eval "${command}"; then
        echo -e "${GREEN}✓ ${name} installed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to install ${name}${NC}"
        return 1
    fi
    echo ""
}

# Install all plugins
echo "Starting plugin installation..."
echo ""

# 1. OpenDesign
install_plugin "OpenDesign" \
    "npm install -g @open-design/cli" \
    "https://github.com/nexu-io/open-design"

# 2. Archify
install_plugin "Archify" \
    "npm install -g archify" \
    "https://github.com/tt-a1i/archify"

# 3. Ruflo
install_plugin "Ruflo" \
    "npm install -g ruflo" \
    "https://github.com/ruvnet/ruflo"

# 4. OpenViking
install_plugin "OpenViking" \
    "npm install -g @volcengine/openviking" \
    "https://github.com/volcengine/OpenViking"

# 5. DeepSeek-Reasonix
install_plugin "DeepSeek-Reasonix" \
    "npm install -g deepseek-reasonix" \
    "https://github.com/esengine/DeepSeek-Reasonix"

# 6. DSH Desktop
install_plugin "DSH Desktop" \
    "npm install -g @anywhere-labs/dsh-desktop" \
    "https://github.com/anywhere-labs/dsh-desktop"

# 7. NocoBase
install_plugin "NocoBase" \
    "npm install -g nocobase" \
    "https://github.com/nocobase/nocobase"

# 8. DSH Free Model
install_plugin "DSH Free Model" \
    "npm install -g dsh-free-model" \
    "https://github.com/Ebony-Vinyl/dsh-our-free-model"

echo "===================================="
echo -e "${GREEN}All plugins installed successfully!${NC}"
echo ""
echo "You can now manage these plugins from the DeepSeek Desktop application."
echo "Open the app and navigate to the 'Plugins' section."
echo ""
echo "To verify installations, run:"
echo "  npm list -g --depth=0"
echo ""
