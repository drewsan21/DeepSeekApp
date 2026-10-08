#!/usr/bin/env node

/**
 * Electron App Structure Verification Script
 * 
 * This script verifies that all required files exist and are properly configured
 * for the Electron application to build and run.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'electron/main.js',
  'electron/preload.js',
  'electron/ipc-handlers.js',
  'package.json',
  'dist/index.html',
];

const REQUIRED_DIRECTORIES = [
  'electron',
  'dist',
  'src',
];

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${filePath} - MISSING`);
    return false;
  }
}

function checkDirectory(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    console.log(`✅ ${dirPath}/`);
    return true;
  } else {
    console.log(`❌ ${dirPath}/ - MISSING`);
    return false;
  }
}

function checkPackageJson() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log('❌ package.json - MISSING');
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  let valid = true;
  
  // Check for electron dependency
  if (pkg.dependencies?.electron || pkg.devDependencies?.electron) {
    console.log('✅ electron dependency found');
  } else {
    console.log('❌ electron dependency MISSING');
    valid = false;
  }
  
  // Check for main field
  if (pkg.main) {
    console.log(`✅ main field: ${pkg.main}`);
  } else {
    console.log('❌ main field MISSING in package.json');
    valid = false;
  }
  
  // Check for build config
  if (pkg.build) {
    console.log('✅ electron-builder config found');
  } else {
    console.log('⚠️  electron-builder config MISSING (optional)');
  }
  
  return valid;
}

console.log('🔍 Verifying Electron App Structure\n');

console.log('📁 Checking directories:');
let allDirsExist = true;
for (const dir of REQUIRED_DIRECTORIES) {
  if (!checkDirectory(dir)) {
    allDirsExist = false;
  }
}

console.log('\n📄 Checking files:');
let allFilesExist = true;
for (const file of REQUIRED_FILES) {
  if (!checkFile(file)) {
    allFilesExist = false;
  }
}

console.log('\n📦 Checking package.json:');
const pkgValid = checkPackageJson();

console.log('\n' + '='.repeat(50));
if (allDirsExist && allFilesExist && pkgValid) {
  console.log('✅ All checks passed! Electron app structure is valid.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. In another terminal: npm run electron:dev');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}
