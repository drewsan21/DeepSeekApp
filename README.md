# DeepSeek Desktop — Implementation Dashboard

An interactive web-based project dashboard that visualizes the complete implementation plan for the **DeepSeek Desktop** application — a single Debian Electron/Chromium application combining the DeepSeek Harness, account authentication, provider integration, and browser tooling with isolated credentials and sessions.

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
