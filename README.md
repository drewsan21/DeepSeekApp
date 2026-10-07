# DeepSeek Desktop

> A cross-platform Electron/Chromium desktop application combining the DeepSeek Harness, account authentication, provider integration, and browser tooling — with isolated credentials and browser sessions.
>
> **Platforms:** Windows (.exe) • Linux (.deb) • macOS (.dmg)

This repository contains:
1. **The Electron Application** — A complete cross-platform desktop app (`apps/desktop/`, `packages/`)
2. **Implementation Dashboard** — An interactive web-based visualization of the project plan (`src/`)

## 📦 What's Included

### Electron Application (Cross-Platform)
- ✅ Monorepo with 5 core packages
- ✅ Secure IPC bridge with 27 channels
- ✅ OS keyring integration (Windows Credential Manager / Linux Secret Service)
- ✅ Isolated browser sessions
- ✅ Permission-based action approval
- ✅ Windows .exe installer (NSIS)
- ✅ Linux .deb package
- ✅ React + Vite renderer with dark theme

### Implementation Dashboard (Web)
- ✅ Interactive project roadmap with progress tracking
- ✅ Architecture diagrams and component explorer
- ✅ Feature matrix and security overview
- ✅ Real-time visualization of all 72+ features

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18 ([download](https://nodejs.org/))
- **npm** >= 9 (ships with Node.js)

### Installation

**Linux / macOS:**
```bash
chmod +x install.sh
./install.sh
```

**Windows:**
```cmd
install.bat
```

All dependencies are installed locally into the project folder (`./node_modules`). Nothing is installed globally.

### Running the App

**Linux / macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

The app will start a local development server and open your browser automatically at:
```
http://localhost:3000
```

If port 3000 is busy, the script will automatically try the next available port.

### ⚠️ Important: Shell Script Permissions

If you cloned this repository on Linux/macOS and the scripts aren't executable, run:

```bash
chmod +x install.sh start.sh serve.sh
```

This is automatically handled by `.gitattributes` but may need manual fixing in some cases.

## 📁 Project Structure

```
deepseek-desktop/
├── install.sh              # Linux/macOS installer
├── install.bat             # Windows installer
├── start.sh                # Linux/macOS starter
├── start.bat               # Windows starter
├── README.md               # This file
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── index.html              # Entry HTML
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Main app with navigation
│   ├── index.css           # Tailwind CSS
│   └── components/
│       ├── OverviewPanel.tsx       # Dashboard overview
│       ├── ArchitectureView.tsx    # System architecture
│       ├── PhaseRoadmap.tsx        # 11-phase roadmap
│       ├── ComponentExplorer.tsx   # Core components
│       ├── FeatureMatrix.tsx       # Feature audit
│       └── SecurityOverview.tsx    # Security architecture
└── dist/                   # Production build output
```

## 🎯 Features

The dashboard visualizes the full implementation plan across **6 interactive views**:

| View | Contents |
|------|----------|
| **Overview** | Stats, core principles, 3 DeepSeek experiences, tech stack, user journey |
| **Architecture** | 5-layer system diagram, IPC allow/block lists, monorepo structure, 12 package boundaries |
| **Roadmap** | All 11 phases with expandable deliverables & verification criteria |
| **Components** | 8 core components with interfaces, data model (7 tables), error codes, feature flags |
| **Features** | DeepSeek++ audit matrix (14 features), keyboard shortcuts, context menu preview, tool registry |
| **Security** | 5 security rule categories, permission defaults, 6 prompt-injection defense tests, audit checklist |

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `./install.sh` / `install.bat` | Install all dependencies locally |
| `./start.sh` / `start.bat` | Start dev server on localhost (with hot reload) |
| `./serve.sh` / `serve.bat` | Build + serve optimized production build |
| `npm run dev` | Start Vite dev server (manual) |
| `npm run build` | Build for production |
| `npm run typecheck` | Run TypeScript type checking |

## 📦 Self-Contained Installation

All scripts are designed to keep everything **within the project folder**:

- **Dependencies** → `./node_modules/`
- **npm cache** → `./.npm-cache/`
- **Build output** → `./dist/`

You can move the entire project folder to another machine (with Node.js installed) and re-run `install.sh` / `install.bat` to restore the environment.

To start fresh:
```bash
# Linux / macOS
rm -rf node_modules .npm-cache dist
./install.sh

# Windows
rmdir /s /q node_modules .npm-cache dist
install.bat
```

## 🌐 Network Access

By default, the dev server binds to `0.0.0.0`, so it's accessible from other devices on your local network:
- From the host machine: `http://localhost:3000`
- From other devices: `http://<your-ip>:3000`

To use a different port:
```bash
PORT=4000 ./start.sh
# or
set PORT=4000 && start.bat
```

## 🛠️ Technology Stack

- **React 18** — UI framework
- **Vite 6** — Build tool & dev server
- **TypeScript 5** — Type safety
- **Tailwind CSS 4** — Styling
- **Framer Motion** — Animations
- **Lucide React** — Icons

## 📋 Implementation Plan Summary

This dashboard represents the implementation plan for a **single Debian Electron/Chromium application** that:

1. Combines the existing DeepSeek Harness, account authentication, and provider integration
2. Maintains strict credential isolation (credentials never pass through renderer → IPC)
3. Uses separate Chromium sessions for auth, browsing, and agent workspaces
4. Prioritizes reuse of existing Harness and DeepSeek++ code via adapters
5. Packages as a `.deb` for Linux (x64 + arm64)

The plan covers **11 development phases**, **12 core packages**, **46+ security controls**, and **67 planned features**.

## 📄 License

This project is provided as an implementation reference.

## 🐙 Publishing to GitHub

This repository is ready for GitHub publishing with the following features:

### ✅ Included Files
- **`.gitignore`** — Comprehensive ignore rules for node_modules, dist, logs, etc.
- **`.gitattributes`** — Proper line ending handling (LF for Unix, CRLF for Windows batch files)
- **`LICENSE`** — MIT license for open source
- **`CONTRIBUTING.md`** — Guidelines for contributors
- **`README.md`** — Complete documentation

### 📦 What's Not Tracked
The following are automatically excluded from Git:
- `node_modules/` — Dependencies (reinstall with `./install.sh`)
- `dist/` — Build output (regenerate with `npm run build`)
- `.npm-cache/` — Local npm cache
- Log files, editor configs, OS-specific files

### 🔧 Common Issues & Solutions

**Issue: Shell scripts not executable after clone**
```bash
# Fix permissions
chmod +x install.sh start.sh serve.sh
```

**Issue: Line ending warnings**
The `.gitattributes` file handles this automatically. If you see warnings:
```bash
# Renormalize line endings
git add .gitattributes
git rm --cached -r .
git reset --hard
```

**Issue: Large files in Git history**
If you accidentally committed large files:
```bash
# Use git-filter-repo or BFG Repo-Cleaner
# See: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

**Issue: package-lock.json conflicts**
This is normal. Accept incoming changes and run:
```bash
npm install
```

### 🚀 Creating a New Repository

1. Create a new repository on GitHub
2. Don't initialize with README (we already have one)
3. Follow GitHub's instructions to push:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 📋 Pre-Push Checklist

Before pushing to GitHub, ensure:
- [ ] No sensitive data (API keys, tokens, passwords) in code
- [ ] `.gitignore` is working (run `git status` to verify)
- [ ] README is complete and accurate
- [ ] LICENSE file is present
- [ ] All tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] No large binary files (>100MB)

### 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use environment variables for sensitive configuration
- Review all code before pushing to ensure no secrets are exposed
- Enable GitHub's secret scanning for additional protection
