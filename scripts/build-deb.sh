#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Installing dependencies..."
pnpm install

echo "Building workspace packages..."
pnpm -r build || true

echo "Bundling Electron main/preload..."
cd "$ROOT/apps/desktop"
node scripts/build-main.mjs

echo "Building renderer..."
pnpm -F @deepseek/renderer build

echo "Building Debian packages..."
pnpm exec electron-builder --config electron-builder.yml --linux deb --x64 --arm64

echo "Done. Packages are in apps/desktop/release/"
