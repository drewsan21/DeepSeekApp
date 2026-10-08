#!/bin/bash

# Linux Build Script
# Builds DeepSeek Desktop for Linux (deb and AppImage)

set -e

echo "🐧 Building DeepSeek Desktop for Linux..."
echo ""

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

# Step 4: Build Linux packages
echo "📦 Step 4/5: Building Linux packages..."
npx electron-builder --linux --x64 --arm64
echo "✅ Linux packages built"
echo ""

# Step 5: Verify outputs
echo "🔍 Step 5/5: Verifying outputs..."
if [ -d "release" ]; then
    echo "✅ Release directory exists"
    
    # Check for deb package
    if ls release/*.deb 1> /dev/null 2>&1; then
        echo "✅ Debian package found:"
        ls -lh release/*.deb
    else
        echo "❌ Debian package not found"
    fi
    
    # Check for AppImage
    if ls release/*.AppImage 1> /dev/null 2>&1; then
        echo "✅ AppImage found:"
        ls -lh release/*.AppImage
    else
        echo "❌ AppImage not found"
    fi
    
    echo ""
    echo "📊 Build Summary:"
    echo "  Output directory: release/"
    du -sh release/
    echo ""
    
    # Show package info
    if ls release/*.deb 1> /dev/null 2>&1; then
        echo "📦 Debian Package Info:"
        DEB_FILE=$(ls release/*.deb | head -n 1)
        dpkg-deb -I "$DEB_FILE" | grep -E "Package|Version|Architecture|Installed-Size" || true
        echo ""
    fi
    
    echo "✅ Linux build complete!"
    echo ""
    echo "📥 Installation Instructions:"
    echo ""
    echo "For Debian/Ubuntu:"
    echo "  sudo apt install ./release/deepseek-desktop_*.deb"
    echo ""
    echo "For other Linux distributions (AppImage):"
    echo "  chmod +x release/DeepSeek-Desktop-*.AppImage"
    echo "  ./release/DeepSeek-Desktop-*.AppImage"
else
    echo "❌ Release directory not found"
    exit 1
fi
