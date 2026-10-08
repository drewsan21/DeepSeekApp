# DeepSeek Desktop User Manual

Welcome to DeepSeek Desktop! This manual will guide you through installing, configuring, and using the application.

## 📦 Installation

### Windows

1. Download the installer from [GitHub Releases](https://github.com/deepseek/deepseek-desktop/releases)
2. Run `DeepSeek-Desktop-Setup-x.x.x.exe`
3. Follow the installation wizard
4. Launch DeepSeek Desktop from the Start Menu or Desktop shortcut

**Portable Version:**
- Download `DeepSeek-Desktop-Portable-x.x.x.exe`
- Run directly without installation
- Store on USB drive for portable use

### Linux

**Debian/Ubuntu:**
```bash
sudo apt install ./deepseek-desktop_x.x.x_amd64.deb
```

**Other Linux:**
```bash
chmod +x DeepSeek-Desktop-x.x.x.AppImage
./DeepSeek-Desktop-x.x.x.AppImage
```

### macOS

1. Download `DeepSeek-Desktop-x.x.x.dmg`
2. Open the DMG file
3. Drag DeepSeek Desktop to Applications folder
4. Launch from Applications or Spotlight

## 🚀 First Launch

### Initial Setup

1. **Launch the application**
   - Windows: Start Menu → DeepSeek Desktop
   - Linux: Applications → DeepSeek Desktop
   - macOS: Applications → DeepSeek Desktop

2. **Sign in (Optional)**
   - Click "Sign in" in the top bar
   - Choose your provider (DeepSeek, Qwen, etc.)
   - Follow the authentication flow
   - Your credentials are stored securely in your OS keyring

3. **Configure Providers (Optional)**
   - Navigate to Providers view
   - Select a provider
   - Enter API key if required
   - Save configuration

## 📖 Using the Application

### Harness View

The Harness is the main AI assistant interface.

**Starting a Task:**
1. Navigate to Harness view
2. Enter your prompt in the text area
3. Click "Start task"
4. Watch the AI response stream in real-time

**Viewing Events:**
- Thinking process
- Tool calls
- Tool results
- Final response
- Errors (if any)

### Browser View

Integrated web browser with AI assistance.

**Basic Navigation:**
1. Navigate to Browser view
2. Enter URL in the address bar
3. Press Enter or click "Go"
4. Browse the web normally

**Tab Management:**
- Click "+" to create new tab
- Click tab to switch
- Click "×" to close tab
- Tabs are isolated from your auth session

**AI Actions:**
- Select text on a page
- Right-click → Choose action:
  - Ask DeepSeek
  - Summarize
  - Explain
  - Rewrite
  - Translate

**Side Panel:**
- Always visible on the right
- Shows AI responses
- Quick actions for selected text

### Browser Use View

Advanced browser automation controls.

**Available Actions:**
- Navigate to URL
- Click elements
- Fill form inputs
- Take screenshots
- Scrape content
- Execute JavaScript

**Using Actions:**
1. Navigate to Browser Use view
2. Select action type
3. Enter parameters (URL, selector, etc.)
4. Click "Execute"
5. View results

**Security:**
- All actions require approval
- Review action details carefully
- Approve or deny each action

### Providers View

Manage AI providers and models.

**Provider Selection:**
1. Navigate to Providers view
2. Click on a provider card
3. Provider becomes active
4. Models update automatically

**Configuration:**
1. Click "Configure" on a provider
2. Enter API key (if required)
3. Enter base URL (if custom)
4. Click "Save"

**Status Indicators:**
- 🟢 Connected: Provider is configured and ready
- 🔴 Not configured: Provider needs setup

### MCP Servers View

Manage Model Context Protocol servers.

**Starting a Server:**
1. Navigate to MCP Servers view
2. Find the server you want
3. Click "Start"
4. Wait for status to change to "running"

**Stopping a Server:**
1. Find the running server
2. Click "Stop"
3. Wait for status to change to "stopped"

**Viewing Tools:**
1. Click "Expand" on a server
2. View available tools
3. See tool descriptions

### GitHub View

GitHub integration for repositories, issues, and PRs.

**Authentication:**
1. Navigate to GitHub view
2. Click "Sign in with GitHub"
3. Authorize the application
4. You're now connected

**Viewing Repositories:**
1. Click "Repositories" tab
2. Browse your repositories
3. Click to view details

**Managing Issues:**
1. Click "Issues" tab
2. View open/closed issues
3. Create new issues
4. Update existing issues

**Pull Requests:**
1. Click "Pull Requests" tab
2. View open/merged PRs
3. Create new PRs
4. Review and merge PRs

### Skills View

Skill marketplace for extending functionality.

**Browsing Skills:**
1. Navigate to Skills view
2. Browse available skills
3. Filter by category
4. Search by name

**Installing Skills:**
1. Find a skill you want
2. Click "Install"
3. Wait for installation
4. Skill is now available

**Managing Skills:**
- Enable/Disable: Toggle skill activation
- Uninstall: Remove skill
- Configure: Adjust skill settings

### Projects View

Project synchronization and management.

**Adding a Project:**
1. Navigate to Projects view
2. Click "Add Project"
3. Enter local path
4. Enter remote URL (optional)
5. Click "Add"

**Syncing Projects:**
1. Find the project
2. Click "Sync" button
3. Wait for sync to complete
4. Status updates automatically

**Sync All:**
1. Click "Sync All" button
2. All projects sync in parallel
3. Monitor progress

### Settings View

Application settings and preferences.

**General Settings:**
- Theme: Light/Dark/System
- Language: Application language
- Startup: Launch on system startup
- Minimize to tray: Close to system tray

**Provider Settings:**
- Configure API keys
- Set default provider
- Custom endpoints

**Permission Settings:**
- Site-specific permissions
- Default permission levels
- Reset permissions

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
- `Ctrl/Cmd + Shift + P` - Open command palette
- `Ctrl/Cmd + Shift + B` - Toggle browser panel
- `Ctrl/Cmd + Shift + D` - Open DeepSeek panel

### Browser Shortcuts
- `Ctrl/Cmd + T` - New tab
- `Ctrl/Cmd + W` - Close tab
- `Ctrl/Cmd + Tab` - Next tab
- `Ctrl/Cmd + Shift + Tab` - Previous tab
- `Ctrl/Cmd + L` - Focus address bar

### Navigation Shortcuts
- `Ctrl/Cmd + 1` - Harness view
- `Ctrl/Cmd + 2` - Browser view
- `Ctrl/Cmd + 3` - Browser Use view
- `Ctrl/Cmd + 4` - Providers view
- `Ctrl/Cmd + 5` - MCP Servers view
- `Ctrl/Cmd + 6` - GitHub view
- `Ctrl/Cmd + 7` - Skills view
- `Ctrl/Cmd + 8` - Projects view
- `Ctrl/Cmd + 9` - Settings view

## 🔒 Security

### Credential Storage
- All credentials stored in OS keyring
- Never stored in plain text
- Encrypted at rest
- Isolated from browser sessions

### Session Isolation
- Auth session: Separate partition
- Browser session: Separate partition
- No cross-contamination
- Cookies isolated

### Permissions
- Granular permission system
- User approval required
- Site-specific settings
- Default deny for sensitive operations

### Network Security
- HTTPS only for API calls
- Certificate validation
- No mixed content
- Secure WebSocket connections

## 🐛 Troubleshooting

### Application Won't Start
1. Check system requirements
2. Verify installation
3. Check logs in `~/.deepseek-desktop/logs/`
4. Try reinstalling

### Authentication Issues
1. Verify credentials
2. Check network connection
3. Clear cached tokens
4. Re-authenticate

### Performance Issues
1. Close unused tabs
2. Disable unused MCP servers
3. Check system resources
4. Restart application

### Browser Issues
1. Clear browser cache
2. Check permissions
3. Disable extensions
4. Restart browser view

### Getting Help
- Check the [FAQ](FAQ.md)
- Search [GitHub Issues](https://github.com/deepseek/deepseek-desktop/issues)
- Ask in [GitHub Discussions](https://github.com/deepseek/deepseek-desktop/discussions)
- Email: support@deepseek.com

## 📚 Additional Resources

- [API Documentation](API.md)
- [Developer Guide](DEVELOPER.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [Contributing Guide](CONTRIBUTING.md)

## 🎉 Enjoy DeepSeek Desktop!

Thank you for using DeepSeek Desktop. We hope it enhances your productivity and workflow.

Happy coding! 🚀
