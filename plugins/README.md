# 🧩 DeepSeek Desktop Plugins

This directory contains the plugin integration system for DeepSeek Desktop, allowing users to install and manage 8 powerful external tools directly from the application.

## 📦 Available Plugins

| Plugin | Category | Description | Size |
|--------|----------|-------------|------|
| **OpenDesign** | Design | Collaborative AI Design Agent Workspace | ~250MB |
| **Archify** | Visualization | Turn ideas into beautiful interactive diagrams | ~50MB |
| **Ruflo** | AI Agents | Agent meta-harness for multi-player swarms | ~180MB |
| **OpenViking** | Database | Self-evolving Context Database for AI Agents | ~300MB |
| **DeepSeek-Reasonix** | AI Models | Advanced reasoning extension for DeepSeek | ~120MB |
| **DSH Desktop** | Desktop | DeepSeek Harness Desktop environment | ~400MB |
| **NocoBase** | No-Code | No-code platform for building applications | ~350MB |
| **DSH Free Model** | AI Models | Free model access for DeepSeek Harness | ~80MB |

## 🚀 Quick Start

### Install All Plugins

**Linux/macOS:**
```bash
chmod +x scripts/install-all-plugins.sh
./scripts/install-all-plugins.sh
```

**Windows:**
```cmd
scripts\install-all-plugins.bat
```

### Install Individual Plugins

**Linux/macOS:**
```bash
chmod +x scripts/install-plugin.sh
./scripts/install-plugin.sh <plugin-name>
```

**Examples:**
```bash
./scripts/install-plugin.sh archify
./scripts/install-plugin.sh openviking
./scripts/install-plugin.sh ruflo
```

**Windows:**
```cmd
npm install -g archify
npm install -g @volcengine/openviking
npm install -g ruflo
```

## 📋 Plugin Details

### 1. OpenDesign
- **Repository**: https://github.com/nexu-io/open-design
- **Install**: `npm install -g @open-design/cli`
- **Features**:
  - Create prototypes, websites, apps, dashboards
  - AI-powered design generation
  - Collaborative workspace
  - Presentation and image creation

### 2. Archify
- **Repository**: https://github.com/tt-a1i/archify
- **Install**: `npm install -g archify`
- **Features**:
  - Architecture visualization
  - Multiple diagram types (workflow, dataflow, sequence)
  - Interactive diagrams
  - Export options

### 3. Ruflo
- **Repository**: https://github.com/ruvnet/ruflo
- **Install**: `npm install -g ruflo`
- **Features**:
  - Multi-agent swarms
  - Autonomous workflows
  - Adaptive memory
  - Federation support
  - Vector RAG integration

### 4. OpenViking
- **Repository**: https://github.com/volcengine/OpenViking
- **Install**: `npm install -g @volcengine/openviking`
- **Features**:
  - Agent memory management
  - Knowledge RAG
  - Skills integration
  - Vector database
  - Self-evolving context

### 5. DeepSeek-Reasonix
- **Repository**: https://github.com/esengine/DeepSeek-Reasonix
- **Install**: `npm install -g deepseek-reasonix`
- **Features**:
  - Enhanced reasoning capabilities
  - Chain-of-thought processing
  - Complex problem solving
  - DeepSeek model integration

### 6. DSH Desktop
- **Repository**: https://github.com/anywhere-labs/dsh-desktop
- **Install**: `npm install -g @anywhere-labs/dsh-desktop`
- **Features**:
  - Complete desktop application
  - Multi-model support
  - Tool integration
  - Browser automation

### 7. NocoBase
- **Repository**: https://github.com/nocobase/nocobase
- **Install**: `npm install -g nocobase`
- **Features**:
  - No-code app builder
  - Database management
  - API generation
  - Workflow automation

### 8. DSH Free Model
- **Repository**: https://github.com/Ebony-Vinyl/dsh-our-free-model
- **Install**: `npm install -g dsh-free-model`
- **Features**:
  - Free tier access
  - Model switching
  - Usage tracking
  - Cost optimization

## 🖥️ Using Plugins in the App

1. **Open DeepSeek Desktop**
2. **Navigate to Plugins** section in the sidebar
3. **Browse Available Plugins** - View all 8 plugins with details
4. **Install Plugins** - Click "Install" button on any plugin card
5. **Manage Installed Plugins** - View, update, or uninstall from the "Installed" tab
6. **Use Plugin Features** - Access plugin functionality through the app interface

## 🔧 Plugin Management API

### JavaScript API

```javascript
// Get available plugins
const plugins = await window.deepseek.plugins.getAvailable();

// Get installed plugins
const installed = await window.deepseek.plugins.getInstalled();

// Install a plugin
await window.deepseek.plugins.install('archify');

// Uninstall a plugin
await window.deepseek.plugins.uninstall('archify');

// Update a plugin
await window.deepseek.plugins.update('archify');

// Check if plugin is installed
const isInstalled = await window.deepseek.plugins.isInstalled('archify');

// Get plugin info
const info = await window.deepseek.plugins.getInfo('archify');

// Execute plugin command
const result = await window.deepseek.plugins.executeCommand(
  'archify',
  'generate',
  ['--type', 'workflow']
);
```

## 📁 File Structure

```
plugins/
├── README.md                    # This file
├── scripts/
│   ├── install-all-plugins.sh   # Install all plugins (Unix)
│   ├── install-all-plugins.bat  # Install all plugins (Windows)
│   └── install-plugin.sh        # Install individual plugin
├── electron/
│   └── services/
│       └── PluginManager.js     # Plugin management service
└── src/
    └── components/
        └── PluginInstaller.tsx  # Plugin UI component
```

## 🔒 Security

- All plugins are installed from official GitHub repositories
- Plugin commands are executed in isolated environments
- User confirmation required for uninstallation
- Plugin registry stored securely in user data directory

## 🐛 Troubleshooting

### Plugin Installation Fails

**Symptoms**: Error during installation

**Solutions**:
1. Check internet connection
2. Verify npm is installed: `npm --version`
3. Check GitHub repository is accessible
4. Try manual installation via command line
5. Review error logs in developer console

### Plugin Not Appearing in App

**Symptoms**: Installed plugin doesn't show up

**Solutions**:
1. Refresh the plugin list in the app
2. Check plugin is in registry: `cat ~/.config/DeepSeek-Desktop/plugins/registry.json`
3. Verify plugin directory exists
4. Restart the application

### Plugin Command Fails

**Symptoms**: Error when executing plugin command

**Solutions**:
1. Verify plugin is fully installed
2. Check plugin documentation for correct syntax
3. Review error output
4. Try running command manually in terminal

## 📚 Documentation

- [Plugin Integration Guide](../PLUGIN_INTEGRATION.md) - Complete technical documentation
- [Plugin Manager API](../electron/services/PluginManager.js) - Source code documentation
- [Plugin UI Component](../src/components/PluginInstaller.tsx) - Component documentation

## 🤝 Contributing

To add a new plugin:

1. Add plugin definition to `PluginManager.getAvailablePlugins()`
2. Include metadata: id, name, description, repo, version, category, size, installCommand, features
3. Test installation process
4. Update documentation
5. Submit pull request

## 📄 License

Plugin system is part of DeepSeek Desktop and follows the same license.

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review plugin documentation
3. Check GitHub repository issues
4. Open an issue in DeepSeek Desktop repository
