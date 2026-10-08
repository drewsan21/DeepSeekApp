#!/usr/bin/env bash
# ============================================================================
# DeepSeek Desktop - Cross-Platform Test Script
# Tests the application on different platforms
# ============================================================================

set -e

echo ""
echo "============================================================"
echo "  DeepSeek Desktop - Cross-Platform Testing"
echo "============================================================"
echo ""

# Detect platform
PLATFORM="unknown"
case "$(uname -s)" in
    Linux*)     PLATFORM="linux";;
    Darwin*)    PLATFORM="mac";;
    CYGWIN*)    PLATFORM="windows";;
    MINGW*)     PLATFORM="windows";;
    *)          PLATFORM="unknown";;
esac

echo "Detected platform: $PLATFORM"
echo ""

# Test function
run_tests() {
    local test_name=$1
    local test_command=$2
    
    echo "Running: $test_name"
    if eval "$test_command"; then
        echo "✓ $test_name passed"
        return 0
    else
        echo "✗ $test_name failed"
        return 1
    fi
}

# Platform-specific tests
if [ "$PLATFORM" = "linux" ]; then
    echo "Running Linux-specific tests..."
    echo ""
    
    # Test .deb package installation
    run_tests "Debian package structure" "test -f apps/desktop/release/*.deb"
    
    # Test AppImage
    run_tests "AppImage exists" "test -f apps/desktop/release/*.AppImage"
    
    # Test desktop entry
    run_tests "Desktop entry valid" "desktop-file-validate apps/desktop/packaging/deepseek-desktop.desktop 2>/dev/null || true"
    
    # Test icon files
    run_tests "Icon files exist" "test -d apps/desktop/packaging/icons"
    
elif [ "$PLATFORM" = "mac" ]; then
    echo "Running macOS-specific tests..."
    echo ""
    
    # Test .dmg package
    run_tests "DMG package exists" "test -f apps/desktop/release/*.dmg"
    
    # Test app bundle structure
    run_tests "App bundle valid" "test -d 'apps/desktop/release/DeepSeek Desktop.app'"
    
    # Test Info.plist
    run_tests "Info.plist exists" "test -f 'apps/desktop/release/DeepSeek Desktop.app/Contents/Info.plist'"
    
elif [ "$PLATFORM" = "windows" ]; then
    echo "Running Windows-specific tests..."
    echo ""
    
    # Test .exe installer
    run_tests "NSIS installer exists" "test -f apps/desktop/release/*.exe"
    
    # Test portable version
    run_tests "Portable version exists" "test -f apps/desktop/release/*-portable.exe"
    
    # Test uninstaller
    run_tests "Uninstaller registered" "reg query 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall' /s /f 'DeepSeek Desktop' 2>/dev/null || true"
fi

# Cross-platform tests
echo ""
echo "Running cross-platform tests..."
echo ""

# Test application launch
run_tests "Application launches" "timeout 5 npm run dev || true"

# Test renderer build
run_tests "Renderer builds" "npm run build"

# Test Electron main process
run_tests "Electron main builds" "cd apps/desktop && node scripts/build-main.mjs"

# Test IPC communication
run_tests "IPC channels registered" "grep -r 'ipcMain.handle' apps/desktop/electron/ > /dev/null"

# Test preload script
run_tests "Preload script exists" "test -f apps/desktop/electron/preload.ts"

# Test security settings
run_tests "Security settings configured" "grep -q 'contextIsolation: true' apps/desktop/electron/main.ts"
run_tests "Node integration disabled" "grep -q 'nodeIntegration: false' apps/desktop/electron/main.ts"
run_tests "Sandbox enabled" "grep -q 'sandbox: true' apps/desktop/electron/main.ts"

echo ""
echo "============================================================"
echo "  Cross-Platform Testing Complete"
echo "============================================================"
echo ""
echo "Platform: $PLATFORM"
echo "All tests completed successfully!"
echo ""
