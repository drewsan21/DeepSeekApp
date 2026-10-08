# DeepSeek Desktop — TODO List

> Actionable task list organized by priority and phase

---

## 🔴 Critical (Must Do)

### Windows Support
- [ ] Update `electron-builder.yml` with Windows target (NSIS installer)
- [ ] Create Windows app icon (`.ico` format, 256x256)
- [ ] Update `install.bat` to generate `.exe` installer
- [ ] Create `scripts/build-exe.ps1` PowerShell build script
- [ ] Test Windows build on Windows 10/11
- [ ] Verify Windows keyring integration (Credential Manager)

### Renderer UI Completion
- [ ] Implement command palette (Ctrl+Shift+P)
- [ ] Add keyboard shortcuts for all major actions
- [ ] Implement markdown rendering for assistant output
- [ ] Add task history view
- [ ] Create onboarding flow for first-time users
- [ ] Add error boundaries and recovery UI
- [ ] Implement toast notifications
- [ ] Add loading states and skeleton screens
- [ ] Create empty states for each panel

### Testing
- [ ] Write unit tests for `packages/shared`
- [ ] Write unit tests for `packages/secrets`
- [ ] Write unit tests for `packages/auth`
- [ ] Write unit tests for `packages/harness`
- [ ] Write unit tests for `packages/browser`
- [ ] Write integration tests for IPC channels
- [ ] Write E2E tests for main user flows
- [ ] Test on Debian 12 (x64)
- [ ] Test on Ubuntu 22.04 (x64)
- [ ] Test on Ubuntu 24.04 (x64)
- [ ] Test on Windows 10 (x64)
- [ ] Test on Windows 11 (x64)

---

## 🟡 High Priority (Should Do)

### UI Polish
- [ ] Add animated transitions between views
- [ ] Implement drag-and-drop tab reordering
- [ ] Add split-pane workspace layout option
- [ ] Implement theme customization (light/dark/system)
- [ ] Add syntax highlighting for code blocks
- [ ] Add copy-to-clipboard buttons for code blocks
- [ ] Implement export conversation as markdown
- [ ] Add search within conversations
- [ ] Implement minimap for long outputs
- [ ] Add custom fonts and typography settings

### Windows-Specific Features
- [ ] Implement auto-updater (electron-updater)
- [ ] Add file associations (.deepseek files)
- [ ] Implement system tray integration
- [ ] Add "Start on login" option
- [ ] Implement Windows notifications
- [ ] Add ARM64 Windows support
- [ ] Create portable .exe option (no install)
- [ ] Implement code signing for Windows

### Security Hardening
- [ ] Conduct full security audit
- [ ] Test prompt injection defenses
- [ ] Verify credential isolation
- [ ] Test session isolation thoroughly
- [ ] Audit all IPC channels for validation
- [ ] Test XSS prevention in browser
- [ ] Verify CSP is properly enforced
- [ ] Test memory safety (no leaks)

### Performance
- [ ] Profile renderer performance
- [ ] Optimize tab switching speed
- [ ] Implement lazy loading for views
- [ ] Add virtualization for long lists
- [ ] Optimize memory usage
- [ ] Implement caching for frequently accessed data
- [ ] Add performance monitoring

---

## 🟢 Medium Priority (Nice to Have)

### Enhanced Features
- [ ] Implement workspace templates
- [ ] Add export/import configurations
- [ ] Create plugin system for custom tools
- [ ] Implement shared workspaces
- [ ] Add team provider configs
- [ ] Create prompt template library
- [ ] Implement conversation sharing

### Local AI Integration
- [ ] Add Ollama integration
- [ ] Implement llama.cpp support
- [ ] Create local model management UI
- [ ] Add model benchmarking tools

### Advanced Browser Features
- [ ] Add browser extensions support
- [ ] Implement ad blocking
- [ ] Add reader mode
- [ ] Implement screenshot annotations
- [ ] Add PDF annotation tools

### Developer Experience
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add automated testing on PR
- [ ] Implement automated releases
- [ ] Create contributor documentation
- [ ] Add issue templates
- [ ] Create pull request templates

---

## 🔵 Low Priority (Future Consideration)

### Platform Expansion
- [ ] Create mobile companion app
- [ ] Build web dashboard (cloud sync)
- [ ] Create CLI tool
- [ ] Implement API server mode

### Advanced Features
- [ ] Multi-language UI support (i18n)
- [ ] Voice input/output
- [ ] Image analysis integration
- [ ] Video summarization
- [ ] Real-time collaboration
- [ ] Custom model training interface

---

## 📋 Immediate Next Steps

### This Week
1. [ ] Update `electron-builder.yml` for Windows
2. [ ] Create Windows icon file
3. [ ] Update `install.bat` for exe generation
4. [ ] Implement command palette
5. [ ] Add keyboard shortcuts

### Next Week
1. [ ] Create PowerShell build script
2. [ ] Implement markdown rendering
3. [ ] Add task history view
4. [ ] Create onboarding flow
5. [ ] Write unit tests for shared package

### Week After
1. [ ] Test Windows build
2. [ ] Implement toast notifications
3. [ ] Add loading states
4. [ ] Write integration tests
5. [ ] Conduct security audit

---

## ✅ Completed Tasks

### Phase 1: Foundation ✅
- [x] Create monorepo structure
- [x] Set up pnpm workspaces
- [x] Define shared TypeScript contracts
- [x] Design security architecture
- [x] Design IPC channel structure

### Phase 2: Core Services ✅
- [x] Implement secret store (keytar)
- [x] Implement auth manager
- [x] Implement harness adapter
- [x] Implement browser manager
- [x] Implement permission manager
- [x] Implement provider config manager

### Phase 3: Electron Shell ✅
- [x] Create main process
- [x] Create preload script
- [x] Create IPC router
- [x] Set up Linux .deb packaging
- [x] Create build scripts

### Phase 4: Renderer UI (Partial) ✅
- [x] Set up React + Vite
- [x] Create Zustand store
- [x] Build main UI shell
- [x] Build workspace panel
- [x] Build browser panel
- [x] Build settings panel
- [x] Build approval modal
- [x] Create dark theme CSS

---

## 🎯 Definition of Done

A task is "done" when:
- [ ] Code is written and compiles
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Code review is complete (if applicable)
- [ ] Manual testing is complete
- [ ] No regressions introduced

---

## 📊 Progress Tracking

| Category | Total | Done | In Progress | Remaining |
|----------|-------|------|-------------|-----------|
| Critical | 26 | 0 | 0 | 26 |
| High Priority | 33 | 0 | 0 | 33 |
| Medium Priority | 27 | 0 | 0 | 27 |
| Low Priority | 10 | 0 | 0 | 10 |
| **Total** | **96** | **0** | **0** | **96** |

---

## 🔗 Related Documents

- [ROADMAP.md](./ROADMAP.md) — Project roadmap and timeline
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) — Technical guide
- [README.md](./README.md) — Getting started
