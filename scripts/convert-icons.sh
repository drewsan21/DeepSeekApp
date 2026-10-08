#!/bin/bash

# Icon Conversion Script
# Converts SVG icon to platform-specific formats

set -e

echo "🎨 Converting icons for all platforms..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   - macOS: brew install imagemagick"
    echo "   - Ubuntu: sudo apt-get install imagemagick"
    echo "   - Windows: choco install imagemagick"
    exit 1
fi

# Check if iconutil is available (macOS only)
HAS_ICONUTIL=false
if command -v iconutil &> /dev/null; then
    HAS_ICONUTIL=true
fi

# Create build directory
mkdir -p build/icons

# Convert SVG to PNG (multiple sizes)
echo "📐 Creating PNG icons..."
convert public/icon.svg -resize 16x16 build/icons/icon-16x16.png
convert public/icon.svg -resize 32x32 build/icons/icon-32x32.png
convert public/icon.svg -resize 48x48 build/icons/icon-48x48.png
convert public/icon.svg -resize 64x64 build/icons/icon-64x64.png
convert public/icon.svg -resize 128x128 build/icons/icon-128x128.png
convert public/icon.svg -resize 256x256 build/icons/icon-256x256.png
convert public/icon.svg -resize 512x512 build/icons/icon-512x512.png
convert public/icon.svg -resize 1024x1024 build/icons/icon-1024x1024.png

# Create Windows ICO file
echo "🪟 Creating Windows ICO file..."
convert build/icons/icon-16x16.png \
        build/icons/icon-32x32.png \
        build/icons/icon-48x48.png \
        build/icons/icon-64x64.png \
        build/icons/icon-128x128.png \
        build/icons/icon-256x256.png \
        build/icon.ico

# Create macOS ICNS file (if iconutil is available)
if [ "$HAS_ICONUTIL" = true ]; then
    echo "🍎 Creating macOS ICNS file..."
    mkdir -p build/icon.iconset
    cp build/icons/icon-16x16.png build/icon.iconset/icon_16x16.png
    cp build/icons/icon-32x32.png build/icon.iconset/icon_16x16@2x.png
    cp build/icons/icon-32x32.png build/icon.iconset/icon_32x32.png
    cp build/icons/icon-64x64.png build/icon.iconset/icon_32x32@2x.png
    cp build/icons/icon-128x128.png build/icon.iconset/icon_128x128.png
    cp build/icons/icon-256x256.png build/icon.iconset/icon_128x128@2x.png
    cp build/icons/icon-256x256.png build/icon.iconset/icon_256x256.png
    cp build/icons/icon-512x512.png build/icon.iconset/icon_256x256@2x.png
    cp build/icons/icon-512x512.png build/icon.iconset/icon_512x512.png
    cp build/icons/icon-1024x1024.png build/icon.iconset/icon_512x512@2x.png
    iconutil -c icns build/icon.iconset -o build/icon.icns
    rm -rf build/icon.iconset
else
    echo "⚠️  iconutil not available (not on macOS). Skipping ICNS creation."
    echo "   To create ICNS manually, run this script on macOS."
fi

# Copy main icon to build root for electron-builder
echo "📋 Copying icons to build root..."
cp build/icons/icon-256x256.png build/icon.png

echo "✅ Icon conversion complete!"
echo ""
echo "Created files:"
echo "  - build/icon.ico (Windows)"
if [ "$HAS_ICONUTIL" = true ]; then
    echo "  - build/icon.icns (macOS)"
fi
echo "  - build/icon.png (Linux/general)"
echo "  - build/icons/ (PNG files for all sizes)"
