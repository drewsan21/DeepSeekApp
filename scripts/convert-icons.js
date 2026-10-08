#!/usr/bin/env node

/**
 * Cross-platform icon conversion script
 * Converts SVG to platform-specific formats
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('  Converting Icons');
console.log('========================================\n');

// Check if source icon exists
const sourceIcon = path.join(process.cwd(), 'public', 'icon.svg');
if (!fs.existsSync(sourceIcon)) {
  console.error('[ERROR] Source icon not found: public/icon.svg');
  process.exit(1);
}

console.log('[OK] Source icon found: public/icon.svg\n');

// Create build directories
const buildDir = path.join(process.cwd(), 'build');
const iconsDir = path.join(buildDir, 'icons');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Check for ImageMagick
let convertCmd = null;
try {
  execSync('magick --version', { stdio: 'pipe' });
  convertCmd = 'magick';
} catch {
  try {
    execSync('convert --version', { stdio: 'pipe' });
    convertCmd = 'convert';
  } catch {
    console.error('[ERROR] ImageMagick is not installed');
    console.error('\nPlease install ImageMagick:');
    console.error('  - macOS: brew install imagemagick');
    console.error('  - Ubuntu: sudo apt-get install imagemagick');
    console.error('  - Windows: choco install imagemagick');
    console.error('  - Or download from: https://imagemagick.org/script/download.php');
    process.exit(1);
  }
}

console.log(`[OK] ImageMagick found: ${convertCmd}\n`);

// Helper function to run command
function run(cmd, description) {
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`[OK] ${description}`);
    return true;
  } catch (error) {
    console.error(`[ERROR] ${description}`);
    console.error(error.message);
    return false;
  }
}

// Step 1: Create PNG icons
console.log('[1/3] Creating PNG icons...');
const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
let allSuccess = true;

sizes.forEach(size => {
  const outputFile = path.join(iconsDir, `icon-${size}x${size}.png`);
  const success = run(
    `${convertCmd} "${sourceIcon}" -resize ${size}x${size} "${outputFile}"`,
    `Create ${size}x${size} PNG`
  );
  if (!success) allSuccess = false;
});

if (!allSuccess) {
  console.error('\n[ERROR] Failed to create some PNG icons');
  process.exit(1);
}

console.log('\n[OK] All PNG icons created\n');

// Step 2: Create platform-specific icons
console.log('[2/3] Creating platform-specific icons...');

// Windows ICO
const icoSizes = [16, 32, 48, 64, 128, 256];
const icoInputs = icoSizes.map(size => path.join(iconsDir, `icon-${size}x${size}.png`)).join(' ');
if (!run(`${convertCmd} ${icoInputs} "${path.join(buildDir, 'icon.ico')}"`, 'Create Windows ICO')) {
  console.error('\n[ERROR] Failed to create Windows ICO');
  process.exit(1);
}

// macOS ICNS (only on macOS or if iconutil is available)
const isMac = process.platform === 'darwin';
if (isMac) {
  const iconsetDir = path.join(buildDir, 'icon.iconset');
  if (!fs.existsSync(iconsetDir)) {
    fs.mkdirSync(iconsetDir, { recursive: true });
  }

  // Copy PNGs to iconset with proper naming
  const iconsetMappings = [
    [16, 'icon_16x16.png'],
    [32, 'icon_16x16@2x.png'],
    [32, 'icon_32x32.png'],
    [64, 'icon_32x32@2x.png'],
    [128, 'icon_128x128.png'],
    [256, 'icon_128x128@2x.png'],
    [256, 'icon_256x256.png'],
    [512, 'icon_256x256@2x.png'],
    [512, 'icon_512x512.png'],
    [1024, 'icon_512x512@2x.png']
  ];

  iconsetMappings.forEach(([size, name]) => {
    const src = path.join(iconsDir, `icon-${size}x${size}.png`);
    const dst = path.join(iconsetDir, name);
    fs.copyFileSync(src, dst);
  });

  if (!run(`iconutil -c icns "${iconsetDir}" -o "${path.join(buildDir, 'icon.icns')}"`, 'Create macOS ICNS')) {
    console.warn('[WARN] Failed to create macOS ICNS (iconutil may not be available)');
  }

  // Clean up iconset directory
  fs.rmSync(iconsetDir, { recursive: true, force: true });
} else {
  console.log('[INFO] Skipping macOS ICNS (not on macOS)');
}

// Linux PNG (256x256)
fs.copyFileSync(
  path.join(iconsDir, 'icon-256x256.png'),
  path.join(buildDir, 'icon.png')
);
console.log('[OK] Create Linux PNG');

console.log('\n[OK] All platform-specific icons created\n');

// Step 3: Summary
console.log('[3/3] Summary...');
console.log('\nCreated files:');

const createdFiles = [
  ['build/icon.ico', 'Windows'],
  ['build/icon.png', 'Linux/General'],
  ['build/icons/', 'PNG files']
];

if (isMac) {
  createdFiles.splice(1, 0, ['build/icon.icns', 'macOS']);
}

createdFiles.forEach(([file, platform]) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (fs.statSync(fullPath).isDirectory()) {
      const files = fs.readdirSync(fullPath);
      console.log(`  - ${file} (${files.length} files) - ${platform}`);
    } else {
      const stats = fs.statSync(fullPath);
      const size = (stats.size / 1024).toFixed(2);
      console.log(`  - ${file} (${size} KB) - ${platform}`);
    }
  }
});

console.log('\n========================================');
console.log('  Icon Conversion Complete');
console.log('========================================\n');
