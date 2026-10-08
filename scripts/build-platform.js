#!/usr/bin/env node

/**
 * Cross-platform build script
 * Works on Windows, macOS, and Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.argv[2] || process.platform;

console.log('\n========================================');
console.log(`  DeepSeek Desktop - ${platform.toUpperCase()} Build`);
console.log('========================================\n');

// Helper function to execute commands
function run(cmd, description) {
  console.log(`[RUN] ${description}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`[OK] ${description}\n`);
    return true;
  } catch (error) {
    console.error(`[ERROR] ${description}`);
    console.error(error.message);
    return false;
  }
}

// Step 1: Install dependencies
console.log('[1/5] Installing dependencies...');
if (!run('npm install', 'Install dependencies')) {
  process.exit(1);
}

// Step 2: Convert icons
console.log('[2/5] Converting icons...');
const iconScript = path.join(__dirname, 'convert-icons.js');
if (fs.existsSync(iconScript)) {
  run(`node ${iconScript}`, 'Convert icons');
} else {
  console.log('[WARN] Icon conversion script not found, using existing icons\n');
}

// Step 3: Build the app
console.log('[3/5] Building application...');
if (!run('npm run build', 'Build application')) {
  process.exit(1);
}

// Step 4: Build platform packages
console.log('[4/5] Building platform packages...');
let buildCmd;
switch (platform) {
  case 'win':
  case 'win32':
    buildCmd = 'npx electron-builder --win --x64';
    break;
  case 'linux':
    buildCmd = 'npx electron-builder --linux --x64 --arm64';
    break;
  case 'mac':
  case 'darwin':
    buildCmd = 'npx electron-builder --mac --x64 --arm64';
    break;
  default:
    console.error(`[ERROR] Unknown platform: ${platform}`);
    process.exit(1);
}

if (!run(buildCmd, 'Build platform packages')) {
  process.exit(1);
}

// Step 5: Verify outputs
console.log('[5/5] Verifying outputs...');
const releaseDir = path.join(process.cwd(), 'release');
if (!fs.existsSync(releaseDir)) {
  console.error('[ERROR] Release directory not found');
  process.exit(1);
}

console.log('[OK] Release directory exists\n');

// List files in release directory
const files = fs.readdirSync(releaseDir);
console.log('Build outputs:');
files.forEach(file => {
  const stats = fs.statSync(path.join(releaseDir, file));
  const size = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`  - ${file} (${size} MB)`);
});

console.log('\n========================================');
console.log('  Build Summary');
console.log('========================================');
console.log(`  Output directory: release/`);
console.log(`  Total files: ${files.length}`);
console.log('');

// Platform-specific instructions
switch (platform) {
  case 'win':
  case 'win32':
    console.log('To install:');
    console.log('  1. Open the release folder');
    console.log('  2. Run "DeepSeek-Desktop-Setup-*.exe"');
    console.log('  3. Follow the installation wizard');
    break;
  case 'linux':
    console.log('To install (Debian/Ubuntu):');
    console.log('  sudo apt install ./release/deepseek-desktop_*.deb');
    console.log('');
    console.log('To install (Other Linux):');
    console.log('  chmod +x release/DeepSeek-Desktop-*.AppImage');
    console.log('  ./release/DeepSeek-Desktop-*.AppImage');
    break;
  case 'mac':
  case 'darwin':
    console.log('To install:');
    console.log('  1. Open release/DeepSeek-Desktop-*.dmg');
    console.log('  2. Drag app to Applications folder');
    break;
}

console.log('\n[OK] Build complete!\n');
