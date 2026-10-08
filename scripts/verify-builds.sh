#!/bin/bash

# Build Verification Script
# Verifies that all cross-platform builds are working correctly

set -e

echo "🔍 Verifying Cross-Platform Builds..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# Function to check if file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description: $file"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌${NC} $description: $file (NOT FOUND)"
        ((FAIL++))
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $description: $dir"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌${NC} $description: $dir (NOT FOUND)"
        ((FAIL++))
        return 1
    fi
}

# Function to check if command exists
check_command() {
    local cmd=$1
    local description=$2
    
    if command -v "$cmd" &> /dev/null; then
        echo -e "${GREEN}✅${NC} $description: $cmd"
        ((PASS++))
        return 0
    else
        echo -e "${RED}❌${NC} $description: $cmd (NOT FOUND)"
        ((FAIL++))
        return 1
    fi
}

echo "📋 Checking Build Dependencies..."
echo ""

# Check required tools
check_command "node" "Node.js"
check_command "npm" "npm"
check_command "npx" "npx"

if command -v electron-builder &> /dev/null || npx electron-builder --version &> /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} electron-builder: installed"
    ((PASS++))
else
    echo -e "${RED}❌${NC} electron-builder: not installed"
    ((FAIL++))
fi

echo ""
echo "📁 Checking Project Structure..."
echo ""

# Check project files
check_file "package.json" "package.json"
check_file "electron/main.js" "Electron main process"
check_file "electron/preload.js" "Electron preload script"
check_file "electron/ipc-handlers.js" "IPC handlers"
check_dir "src" "Source directory"
check_dir "dist" "Build output directory"

echo ""
echo "🎨 Checking Build Assets..."
echo ""

# Check build assets
check_dir "build" "Build directory"
check_file "build/entitlements.mac.plist" "macOS entitlements"

if [ -f "build/icon.ico" ]; then
    echo -e "${GREEN}✅${NC} Windows icon: build/icon.ico"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️${NC} Windows icon: build/icon.ico (not created yet)"
    ((WARN++))
fi

if [ -f "build/icon.icns" ]; then
    echo -e "${GREEN}✅${NC} macOS icon: build/icon.icns"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️${NC} macOS icon: build/icon.icns (not created yet)"
    ((WARN++))
fi

if [ -f "build/icon.png" ]; then
    echo -e "${GREEN}✅${NC} Linux icon: build/icon.png"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️${NC} Linux icon: build/icon.png (not created yet)"
    ((WARN++))
fi

echo ""
echo "📦 Checking Build Scripts..."
echo ""

# Check build scripts
check_file "scripts/build-windows.sh" "Windows build script"
check_file "scripts/build-linux.sh" "Linux build script"
check_file "scripts/build-macos.sh" "macOS build script"
check_file "scripts/convert-icons.sh" "Icon conversion script"

# Check if scripts are executable
for script in scripts/build-*.sh scripts/convert-icons.sh; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo -e "${GREEN}✅${NC} $script is executable"
            ((PASS++))
        else
            echo -e "${YELLOW}⚠️${NC} $script is not executable (run: chmod +x $script)"
            ((WARN++))
        fi
    fi
done

echo ""
echo "🔨 Checking Build Configuration..."
echo ""

# Check package.json build config
if grep -q '"electron-builder"' package.json; then
    echo -e "${GREEN}✅${NC} electron-builder in package.json"
    ((PASS++))
else
    echo -e "${RED}❌${NC} electron-builder not in package.json"
    ((FAIL++))
fi

if grep -q '"build":' package.json; then
    echo -e "${GREEN}✅${NC} Build configuration in package.json"
    ((PASS++))
else
    echo -e "${RED}❌${NC} Build configuration missing in package.json"
    ((FAIL++))
fi

# Check for platform-specific configs
if grep -q '"win":' package.json; then
    echo -e "${GREEN}✅${NC} Windows build configuration"
    ((PASS++))
else
    echo -e "${RED}❌${NC} Windows build configuration missing"
    ((FAIL++))
fi

if grep -q '"mac":' package.json; then
    echo -e "${GREEN}✅${NC} macOS build configuration"
    ((PASS++))
else
    echo -e "${RED}❌${NC} macOS build configuration missing"
    ((FAIL++))
fi

if grep -q '"linux":' package.json; then
    echo -e "${GREEN}✅${NC} Linux build configuration"
    ((PASS++))
else
    echo -e "${RED}❌${NC} Linux build configuration missing"
    ((FAIL++))
fi

echo ""
echo "📊 Build Verification Summary"
echo ""
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${YELLOW}Warnings: $WARN${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo ""
    echo "🚀 Ready to build:"
    echo ""
    echo "  Windows:  ./scripts/build-windows.sh"
    echo "  Linux:    ./scripts/build-linux.sh"
    echo "  macOS:    ./scripts/build-macos.sh"
    echo "  All:      npm run electron:build"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    exit 1
fi
