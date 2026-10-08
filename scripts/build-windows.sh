#!/bin/bash

# Windows Build Script
# Builds DeepSeek Desktop for Windows

set -e

echo "🪟 Building DeepSeek Desktop for Windows..."
echo ""

# Check if we're on Windows (or cross-compiling)
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" && "$OSTYPE" != "cygwin" ]]; then
    echo "⚠️  Warning: Not running on Windows. Cross-compilation may have limitations."
    echo ""
fi

# Step 1: Install dependencies
echo "📦 Step 1/5: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Convert icons
echo "🎨 Step 2/5: Converting icons..."
if [ -f "scripts/convert-icons.sh" ]; then
    bash scripts/convert-icons.sh
else
    echo "⚠️  Icon conversion script not found. Using existing icons."
fi
echo ""

# Step 3: Build the app
echo "🔨 Step 3/5: Building application..."
npm run build
echo "✅ Application built"
echo ""

# Step 4: Build Windows packages
echo "📦 Step 4/5: Building Windows packages..."
npx electron-builder --win --x64
echo "✅ Windows packages built"
echo ""

# Step 5: Verify outputs
echo "🔍 Step 5/5: Verifying outputs..."
if [ -d "release" ]; then
    echo "✅ Release directory exists"
    
    # Check for NSIS installer
    if ls release/*.exe 1> /dev/null 2>&1; then
        echo "✅ NSIS installer found:"
        ls -lh release/*.exe
    else
        echo "❌ NSIS installer not found"
    fi
    
    # Check for portable version
    if ls release/*portable*.exe 1> /dev/null 2>&1; then
        echo "✅ Portable version found:"
        ls -lh release/*portable*.exe
    else
        echo "⚠️  Portable version not found (may be included in NSIS installer)"
    fi
    
    echo ""
    echo "📊 Build Summary:"
    echo "  Output directory: release/"
    du -sh release/
    echo ""
    echo "✅ Windows build complete!"
else
    echo "❌ Release directory not found"
    exit 1
fi
