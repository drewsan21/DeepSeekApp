# 🏗️ Cross-Platform Build Guide

Complete guide for building DeepSeek Desktop for Windows, Linux, and macOS.

---

## 📋 Prerequisites

### Required Tools
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**

### Platform-Specific Requirements

#### Windows
- Windows 10/11 (64-bit)
- Visual Studio Build Tools (for native modules)
- PowerShell 5.1+ or Git Bash

#### macOS
- macOS 10.13+ (High Sierra or later)
- Xcode Command Line Tools: `xcode-select --install`
- For code signing: Apple Developer Account

#### Linux
- Ubuntu 20.04+ / Debian 10+ / Fedora 32+
- Build essentials: `sudo apt-get install build-essential`
- For AppImage: `sudo apt-get install libfuse2`

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Convert Icons
```bash
npm run build:icons
```

### 3. Build Application
```bash
# Build for current platform
npm run electron:build

# Or build for specific platform
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:mac    # macOS
npm run build:all    # All platforms
```

### 4. Verify Build
```bash
npm run verify:build
```

---

## 📦 Build Outputs

### Windows
- **NSIS Installer**: `release/DeepSeek-Desktop-Setup-0.1.0.exe`
- **Portable**: `release/DeepSeek-Desktop-0.1.0-portable.exe`

### macOS
- **DMG Installer**: `release/DeepSeek-Desktop-0.1.0.dmg`
- **App Bundle**: Inside DMG or `release/mac/DeepSeek Desktop.app`

### Linux
- **Debian Package**: `release/deepseek-desktop_0.1.0_amd64.deb`
- **AppImage**: `release/DeepSeek-Desktop-0.1.0.AppImage`

---

## 🔧 Detailed Build Instructions

### Windows Build

#### Using Build Script
```bash
./scripts/build-windows.sh
```

#### Manual Build
```bash
# Install dependencies
npm install

# Convert icons
npm run build:icons

# Build application
npm run build

# Build Windows packages
npx electron-builder --win --x64
```

#### Expected Output
```
release/
├── DeepSeek-Desktop-Setup-0.1.0.exe      # NSIS installer
├── DeepSeek-Desktop-0.1.0-portable.exe   # Portable version
├── win-unpacked/                          # Unpacked app
└── builder-effective-config.yaml          # Build config
```

#### Installation
1. Run `DeepSeek-Desktop-Setup-0.1.0.exe`
2. Follow the installation wizard
3. Launch from Start Menu or Desktop shortcut

---

### macOS Build

#### Using Build Script
```bash
./scripts/build-macos.sh
```

#### Manual Build
```bash
# Install dependencies
npm install

# Convert icons
npm run build:icons

# Build application
npm run build

# Build macOS packages
npx electron-builder --mac --x64 --arm64
```

#### Expected Output
```
release/
├── DeepSeek-Desktop-0.1.0.dmg            # DMG installer
├── mac/                                   # App bundle
│   └── DeepSeek Desktop.app
└── builder-effective-config.yaml          # Build config
```

#### Installation
1. Open `DeepSeek-Desktop-0.1.0.dmg`
2. Drag "DeepSeek Desktop" to Applications folder
3. Launch from Applications or Spotlight

#### Code Signing (Optional)
For production builds, code sign the app:

```bash
# Set environment variables
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"

# Build with signing
npx electron-builder --mac --x64 --arm64
```

---

### Linux Build

#### Using Build Script
```bash
./scripts/build-linux.sh
```

#### Manual Build
```bash
# Install dependencies
npm install

# Convert icons
npm run build:icons

# Build application
npm run build

# Build Linux packages
npx electron-builder --linux --x64 --arm64
```

#### Expected Output
```
release/
├── deepseek-desktop_0.1.0_amd64.deb      # Debian package
├── deepseek-desktop_0.1.0_arm64.deb      # ARM64 Debian package
├── DeepSeek-Desktop-0.1.0.AppImage       # AppImage
├── linux-unpacked/                        # Unpacked app
└── builder-effective-config.yaml          # Build config
```

#### Installation

**Debian/Ubuntu:**
```bash
sudo apt install ./release/deepseek-desktop_0.1.0_amd64.deb
```

**Other Linux (AppImage):**
```bash
chmod +x release/DeepSeek-Desktop-0.1.0.AppImage
./release/DeepSeek-Desktop-0.1.0.AppImage
```

---

## 🎨 Icon Conversion

### Automatic Conversion
```bash
npm run build:icons
```

This creates:
- `build/icon.ico` - Windows icon (multi-size)
- `build/icon.icns` - macOS icon (multi-size)
- `build/icon.png` - Linux icon (256x256)
- `build/icons/` - Individual PNG files

### Manual Conversion

#### Windows ICO
```bash
convert public/icon.svg -resize 256x256 build/icon.ico
```

#### macOS ICNS
```bash
# Create iconset
mkdir -p build/icon.iconset
convert public/icon.svg -resize 16x16 build/icon.iconset/icon_16x16.png
convert public/icon.svg -resize 32x32 build/icon.iconset/icon_32x32.png
convert public/icon.svg -resize 128x128 build/icon.iconset/icon_128x128.png
convert public/icon.svg -resize 256x256 build/icon.iconset/icon_256x256.png
convert public/icon.svg -resize 512x512 build/icon.iconset/icon_512x512.png
convert public/icon.svg -resize 1024x1024 build/icon.iconset/icon_1024x1024.png

# Convert to ICNS
iconutil -c icns build/icon.iconset -o build/icon.icns
```

#### Linux PNG
```bash
convert public/icon.svg -resize 256x256 build/icon.png
```

---

## 🔍 Build Verification

### Automated Verification
```bash
npm run verify:build
```

This checks:
- ✅ Build dependencies
- ✅ Project structure
- ✅ Build assets
- ✅ Build scripts
- ✅ Build configuration

### Manual Verification

#### Check Build Output
```bash
ls -lh release/
```

#### Verify Package Contents

**Windows:**
```bash
# Check installer size
ls -lh release/*.exe

# Verify installer (requires 7-Zip)
7z l release/*.exe
```

**macOS:**
```bash
# Check DMG
ls -lh release/*.dmg

# Mount and verify
hdiutil attach release/*.dmg
ls /Volumes/DeepSeek\ Desktop/
hdiutil detach /Volumes/DeepSeek\ Desktop/
```

**Linux:**
```bash
# Check deb package
dpkg-deb -I release/*.deb

# Check AppImage
file release/*.AppImage
```

---

## 🐛 Troubleshooting

### Common Issues

#### "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

#### "Icon file not found"
```bash
npm run build:icons
```

#### "Cannot find module 'electron'"
```bash
npm install
```

#### Build fails on Windows with "MSB3073"
Install Visual Studio Build Tools:
1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "Desktop development with C++"

#### Build fails on macOS with "codesign" error
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Or skip code signing
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run electron:build
```

#### Build fails on Linux with "libfuse" error
```bash
# Install FUSE
sudo apt-get install libfuse2

# Or run AppImage with --no-sandbox
./release/*.AppImage --no-sandbox
```

#### "asar" errors
```bash
# Disable asar packaging (for debugging)
# Edit package.json build.asar = false
```

---

## 📊 Build Configuration

### package.json Build Section

```json
{
  "build": {
    "appId": "com.deepseek.desktop",
    "productName": "DeepSeek Desktop",
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "win": { ... },
    "mac": { ... },
    "linux": { ... }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CSC_LINK` | Code signing certificate path | - |
| `CSC_KEY_PASSWORD` | Certificate password | - |
| `CSC_IDENTITY_AUTO_DISCOVERY` | Auto-discover signing identity | `true` |
| `GH_TOKEN` | GitHub token for updates | - |
| `DEBUG` | Enable debug logging | - |

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Convert icons
        run: npm run build:icons
      
      - name: Build
        run: npm run electron:build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-${{ matrix.os }}
          path: release/
```

---

## 📝 Build Scripts Reference

| Script | Description | Command |
|--------|-------------|---------|
| `build:icons` | Convert icons | `npm run build:icons` |
| `build:win` | Build for Windows | `npm run build:win` |
| `build:linux` | Build for Linux | `npm run build:linux` |
| `build:mac` | Build for macOS | `npm run build:mac` |
| `build:all` | Build for all platforms | `npm run build:all` |
| `verify:build` | Verify build setup | `npm run verify:build` |

---

## 🎯 Best Practices

### Before Building
1. ✅ Run tests: `npm test`
2. ✅ Type check: `npm run typecheck`
3. ✅ Build app: `npm run build`
4. ✅ Convert icons: `npm run build:icons`
5. ✅ Verify setup: `npm run verify:build`

### During Build
1. ✅ Use clean build directory
2. ✅ Monitor build logs
3. ✅ Check for warnings
4. ✅ Verify output files

### After Build
1. ✅ Test installer on clean system
2. ✅ Verify all features work
3. ✅ Check file sizes
4. ✅ Document any issues

---

## 📚 Additional Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [Electron Code Signing](https://www.electron.build/code-signing)
- [Auto-Update Configuration](https://www.electron.build/auto-update)
- [Platform-Specific Issues](https://github.com/electron-userland/electron-builder/issues)

---

## 🆘 Support

If you encounter build issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Run `npm run verify:build` to check setup
3. Check build logs in `release/builder-effective-config.yaml`
4. Open an issue on GitHub with:
   - Platform and version
   - Build logs
   - Error messages
   - Steps to reproduce

---

**Last Updated:** 2024-03-18  
**Build Version:** 0.1.0  
**Status:** ✅ Ready for Production
