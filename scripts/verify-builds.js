#!/usr/bin/env node

/**
 * Cross-platform build verification script
 * Verifies that all build configurations are correct
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n========================================');
console.log('  Verifying Cross-Platform Builds');
console.log('========================================\n');

let pass = 0;
let fail = 0;
let warn = 0;

// Helper functions
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`[OK] ${description}: ${filePath}`);
    pass++;
    return true;
  } else {
    console.log(`[FAIL] ${description}: ${filePath} (NOT FOUND)`);
    fail++;
    return false;
  }
}

function checkDir(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`[OK] ${description}: ${dirPath}`);
    pass++;
    return true;
  } else {
    console.log(`[FAIL] ${description}: ${dirPath} (NOT FOUND)`);
    fail++;
    return false;
  }
}

function checkCommand(cmd, description) {
  try {
    execSync(`${cmd} --version`, { stdio: 'pipe' });
    console.log(`[OK] ${description}: ${cmd}`);
    pass++;
    return true;
  } catch {
    console.log(`[FAIL] ${description}: ${cmd} (NOT FOUND)`);
    fail++;
    return false;
  }
}

// Check build dependencies
console.log('Checking Build Dependencies...\n');

checkCommand('node', 'Node.js');
checkCommand('npm', 'npm');
checkCommand('npx', 'npx');

// Check electron-builder
try {
  execSync('npx electron-builder --version', { stdio: 'pipe' });
  console.log('[OK] electron-builder: installed');
  pass++;
} catch {
  console.log('[FAIL] electron-builder: not installed');
  fail++;
}

console.log('\nChecking Project Structure...\n');

checkFile('package.json', 'package.json');
checkFile('electron/main.js', 'Electron main process');
checkFile('electron/preload.js', 'Electron preload script');
checkFile('electron/ipc-handlers.js', 'IPC handlers');
checkDir('src', 'Source directory');
checkDir('dist', 'Build output directory');

console.log('\nChecking Build Assets...\n');

checkDir('build', 'Build directory');
checkFile('build/entitlements.mac.plist', 'macOS entitlements');

if (checkFile('build/icon.ico', 'Windows icon')) {
  // File exists
} else {
  warn++;
  fail--; // Don't count as fail, just warn
}

if (checkFile('build/icon.png', 'General icon')) {
  // File exists
} else {
  warn++;
  fail--; // Don't count as fail, just warn
}

console.log('\nChecking Build Scripts...\n');

checkFile('scripts/build-platform.js', 'Cross-platform build script');
checkFile('scripts/build-windows.bat', 'Windows build script');
checkFile('scripts/build-linux.sh', 'Linux build script');
checkFile('scripts/build-macos.sh', 'macOS build script');
checkFile('scripts/convert-icons.js', 'Icon conversion script');
checkFile('scripts/convert-icons.bat', 'Windows icon conversion');
checkFile('scripts/verify-builds.js', 'Build verification script');
checkFile('scripts/verify-builds.bat', 'Windows build verification');

console.log('\nChecking Build Configuration...\n');

// Check package.json build config
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.dependencies && packageJson.dependencies['electron-builder']) {
  console.log('[OK] electron-builder in package.json');
  pass++;
} else {
  console.log('[FAIL] electron-builder not in package.json');
  fail++;
}

if (packageJson.build) {
  console.log('[OK] Build configuration in package.json');
  pass++;
} else {
  console.log('[FAIL] Build configuration missing in package.json');
  fail++;
}

// Check for platform-specific configs
if (packageJson.build && packageJson.build.win) {
  console.log('[OK] Windows build configuration');
  pass++;
} else {
  console.log('[FAIL] Windows build configuration missing');
  fail++;
}

if (packageJson.build && packageJson.build.mac) {
  console.log('[OK] macOS build configuration');
  pass++;
} else {
  console.log('[FAIL] macOS build configuration missing');
  fail++;
}

if (packageJson.build && packageJson.build.linux) {
  console.log('[OK] Linux build configuration');
  pass++;
} else {
  console.log('[FAIL] Linux build configuration missing');
  fail++;
}

console.log('\n========================================');
console.log('  Build Verification Summary');
console.log('========================================\n');

console.log(`Passed:   ${pass}`);
console.log(`Warnings: ${warn}`);
console.log(`Failed:   ${fail}`);
console.log('');

if (fail === 0) {
  console.log('[OK] All critical checks passed!\n');
  console.log('Ready to build:\n');
  console.log('  Windows:  npm run build:win');
  console.log('  Linux:    npm run build:linux');
  console.log('  macOS:    npm run build:mac');
  console.log('  All:      npm run build:all');
  console.log('');
  process.exit(0);
} else {
  console.log('[FAIL] Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
