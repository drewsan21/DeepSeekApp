#!/bin/bash

# macOS Build Script
# Builds DeepSeek Desktop for macOS (DMG)

set -e

echo "🍎 Building DeepSeek Desktop for macOS..."
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  Warning: Not running on macOS. Some features may not work correctly."
    echo "   For best results, run this script on macOS."
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

# Step 4: Build macOS packages
echo "📦 Step 4/5: Building macOS packages..."
npx electron-builder --mac --x64 --arm64
echo "✅ macOS packages built"
echo ""

# Step 5: Verify outputs
echo "🔍 Step 5/5: Verifying outputs..."
if [ -d "release" ]; then
    echo "✅ Release directory exists"
    
    # Check for DMG
    if ls release/*.dmg 1> /dev/null 2>&1; then
        echo "✅ DMG installer found:"
        ls -lh release/*.dmg
    else
        echo "❌ DMG installer not found"
    fi
    
    # Check for .app bundle
    if ls -d release/*.app 1> /dev/null 2>&1; then
        echo "✅ .app bundle found:"
        ls -ld release/*.app
    else
        echo "⚠️  .app bundle not found (may be inside DMG)"
    fi
    
    echo ""
    echo "📊 Build Summary:"
    echo "  Output directory: release/"
    du -sh release/
    echo ""
    
    # Show DMG info if available
    if ls release/*.dmg 1> /dev/null 2>&1; then
        echo "💿 DMG Info:"
        DMG_FILE=$(ls release/*.dmg | head -n 1)
        echo "  File: $(basename "$DMG_FILE")"
        echo "  Size: $(du -h "$DMG_FILE" | cut -f1)"
        echo ""
    fi
    
    echo "✅ macOS build complete!"
    echo ""
    echo "📥 Installation Instructions:"
    echo ""
    echo "1. Open the DMG file:"
    echo "   open release/DeepSeek-Desktop-*.dmg"
    echo ""
    echo "2. Drag 'DeepSeek Desktop' to Applications folder"
    echo ""
    echo "3. Launch from Applications or Spotlight"
    echo ""
    
    # Code signing note
    echo "⚠️  Code Signing Note:"
    echo "   This build is not code-signed. Users may see a warning:"
    echo "   'DeepSeek Desktop cannot be opened because it is from an unidentified developer'"
    echo ""
    echo "   To bypass:"
    echo "   1. Right-click the app and select 'Open'"
    echo "   2. Or run: xattr -cr /Applications/DeepSeek\\ Desktop.app"
    echo ""
    echo "   For production builds, obtain an Apple Developer certificate and configure:"
    echo "   - CSC_LINK environment variable"
    echo "   - CSC_KEY_PASSWORD environment variable"
else
    echo "❌ Release directory not found"
    exit 1
fi
