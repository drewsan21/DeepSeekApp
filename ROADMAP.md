# DeepSeek Desktop — Project Roadmap

> A single Electron/Chromium desktop app combining the DeepSeek Harness, account authentication, provider integration, and browser tooling — with isolated credentials and sessions.
>
> **Platforms:** Linux (.deb) + Windows (.exe) + macOS (.dmg)

---

## 🎯 Vision

One installable desktop app where users can:
1. Sign into their DeepSeek account
2. Configure API keys for multiple providers
3. Run Harness agent tasks
4. Browse the web with an integrated browser
5. Ask DeepSeek about any web page
6. Approve agent actions with a permission system
7. Keep everything isolated and secure

---

## 📊 Overall Progress

```
Phase 1: Foundation & Architecture    ████████████████████ 100%
Phase 2: Core Services                ████████████████████ 100%
Phase 3: Electron Shell               ████████████████████ 100%
Phase 4: Renderer UI                  ██████████████░░░░░░  70%
Phase 5: Windows Support              ██████░░░░░░░░░░░░░░  30%
Phase 6: Polish & Testing             ░░░░░░░░░░░░░░░░░░░░   0%
Phase 7: Release                      ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 🗺️ Phase 1: Foundation & Architecture ✅ COMPLETE

### Goals
- [x] Monorepo structure with pnpm workspaces
- [x] Shared TypeScript contracts
- [x] Security architecture design
- [x] IPC channel design
- [x] Component architecture

### Deliverables
- [x] `pnpm-workspace.yaml`
- [x] `packages/shared/` — All TypeScript types
- [x] Architecture documentation
- [x] Security model

---

## 🗺️ Phase 2: Core Services ✅ COMPLETE

### Goals
- [x] Secret store (OS keyring)
- [x] Auth manager (isolated window)
- [x] Harness adapter (stdio streaming)
- [x] Browser manager (tabs + context menu)
- [x] Permission manager
- [x] Provider config manager

### Deliverables
- [x] `packages/secrets/` — keytar integration
- [x] `packages/auth/` — AuthManager with isolated partition
- [x] `packages/harness/` — DeepSeekHarnessAdapter
- [x] `packages/browser/` — BrowserManager with tabs
- [x] `apps/desktop/electron/services/PermissionManager.ts`
- [x] `apps/desktop/electron/services/ProviderConfigManager.ts`

---

## 🗺️ Phase 3: Electron Shell ✅ COMPLETE

### Goals
- [x] Main process bootstrap
- [x] Secure preload bridge
- [x] IPC router
- [x] Linux .deb packaging

### Deliverables
- [x] `apps/desktop/electron/main.ts`
- [x] `apps/desktop/electron/preload.ts`
- [x] `apps/desktop/electron/ipc.ts`
- [x] `apps/desktop/electron-builder.yml`
- [x] `scripts/build-deb.sh`

---

## 🗺️ Phase 4: Renderer UI 🔧 IN PROGRESS (70%)

### Goals
- [x] React + Vite renderer foundation
- [x] Zustand store
- [x] Main UI shell (TopBar, Sidebar, panels)
- [x] Workspace panel
- [x] Browser panel with tab strip
- [x] Settings panel
- [x] Approval modal
- [ ] **Command palette** (Ctrl+Shift+P)
- [ ] **Keyboard shortcuts**
- [ ] **Markdown rendering** for assistant output
- [ ] **Task history** view
- [ ] **Workspace management** (save/load/switch)
- [ ] **Onboarding flow** for first-time users
- [ ] **Error boundary** and recovery UI
- [ ] **Toast notifications** for events
- [ ] **Loading states** and skeleton screens
- [ ] **Empty states** for each panel

### Nice-to-Have UI Improvements
- [ ] Animated transitions between views
- [ ] Drag-and-drop tab reordering
- [ ] Split-pane workspace layout
- [ ] Theme customization (light/dark/system)
- [ ] Custom fonts and typography settings
- [ ] Minimap for long outputs
- [ ] Syntax highlighting for code blocks
- [ ] Copy-to-clipboard buttons
- [ ] Export conversation as markdown/PDF
- [ ] Search within conversations

---

## 🗺️ Phase 5: Windows Support 🔧 IN PROGRESS (30%)

### Goals
- [x] Electron Builder Windows config
- [ ] **NSIS installer** for Windows
- [ ] **Portable .exe** option
- [ ] **Auto-updater** (electron-updater)
- [ ] **Windows-specific** keyring (Credential Manager)
- [ ] **File associations** (.deepseek files)
- [ ] **System tray** integration
- [ ] **Startup on login** option
- [ ] **Windows notifications**
- [ ] **ARM64 Windows** support

### Deliverables
- [ ] `electron-builder.yml` Windows target
- [ ] `scripts/build-exe.ps1` (PowerShell build script)
- [ ] `install.bat` updated for exe generation
- [ ] Windows app icon (`.ico` format)
- [ ] NSIS installer script
- [ ] Code signing setup (optional)

---

## 🗺️ Phase 6: Polish & Testing ⏳ NOT STARTED

### Goals
- [ ] **Unit tests** for all packages
- [ ] **Integration tests** for IPC
- [ ] **E2E tests** with Playwright/Spectron
- [ ] **Security audit** (IPC, credentials, injection)
- [ ] **Performance profiling**
- [ ] **Accessibility audit** (WCAG 2.1 AA)
- [ ] **Cross-platform testing** (Debian, Ubuntu, Windows 10/11)
- [ ] **Memory leak testing**
- [ ] **Stress testing** (many tabs, long sessions)

### Testing Matrix
| Platform | Version | Status |
|----------|---------|--------|
| Debian 12 | x64 | ⏳ Pending |
| Ubuntu 22.04 | x64 | ⏳ Pending |
| Ubuntu 24.04 | x64 | ⏳ Pending |
| Windows 10 | x64 | ⏳ Pending |
| Windows 11 | x64 | ⏳ Pending |
| macOS 14 | arm64 | ⏳ Pending |

---

## 🗺️ Phase 7: Release ⏳ NOT STARTED

### Goals
- [ ] **Version 0.1.0** — Alpha release
- [ ] **GitHub Releases** with binaries
- [ ] **Changelog** generation
- [ ] **Update server** setup
- [ ] **User documentation** website
- [ ] **Contributing guide**
- [ ] **Issue templates**
- [ ] **CI/CD pipeline** (GitHub Actions)

### Release Checklist
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Documentation complete
- [ ] Binaries built for all platforms
- [ ] Code signing (Windows + macOS)
- [ ] Release notes written
- [ ] Announcement drafted

---

## 🚀 Future Roadmap (Post-1.0)

### v1.1 — Enhanced Features
- [ ] Command palette with fuzzy search
- [ ] Task history with search
- [ ] Workspace templates
- [ ] Export/import configurations
- [ ] Plugin system for custom tools

### v1.2 — Collaboration
- [ ] Shared workspaces
- [ ] Team provider configs
- [ ] Prompt template library
- [ ] Conversation sharing

### v1.3 — Local AI
- [ ] Ollama integration
- [ ] llama.cpp support
- [ ] Local model management UI
- [ ] Model benchmarking

### v1.4 — Advanced Browser
- [ ] Browser extensions support
- [ ] Ad blocking
- [ ] Reader mode
- [ ] Screenshot annotations
- [ ] PDF annotation

### v2.0 — Platform Expansion
- [ ] Mobile companion app
- [ ] Web dashboard (cloud sync)
- [ ] CLI tool
- [ ] API server mode

---

## 📅 Estimated Timeline

| Phase | Duration | Target Date |
|-------|----------|-------------|
| Phase 1-3 (Done) | 2 weeks | ✅ Complete |
| Phase 4 (UI Polish) | 2 weeks | Week 4 |
| Phase 5 (Windows) | 1 week | Week 5 |
| Phase 6 (Testing) | 2 weeks | Week 7 |
| Phase 7 (Release) | 1 week | Week 8 |
| **Total to v0.1.0** | **~8 weeks** | **Alpha Release** |

---

## 🎯 Success Criteria for v0.1.0

1. ✅ Installs on Linux (Debian/Ubuntu) via .deb
2. ✅ Installs on Windows via .exe installer
3. ✅ Signs into DeepSeek account
4. ✅ Configures API providers
5. ✅ Runs Harness tasks with streaming
6. ✅ Browses web with integrated browser
7. ✅ Asks DeepSeek about web pages
8. ✅ Approves agent actions
9. ✅ Keeps sessions isolated
10. ✅ Survives restarts without data loss

---

## 🔗 Related Documents

- [TODO.md](./TODO.md) — Actionable task list
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) — Technical guide
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) — What's done
- [FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md) — Feature inventory
- [README.md](./README.md) — Getting started
