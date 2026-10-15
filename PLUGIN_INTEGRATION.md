# 🧩 Plugin Integration System

## Overview

The DeepSeek Desktop application now includes a comprehensive plugin system that allows users to install and manage 8 powerful external tools directly from the app interface.

## Integrated Plugins

### 1. **OpenDesign** (`open-design`)
- **Repository**: https://github.com/nexu-io/open-design
- **Category**: Design
- **Description**: Collaborative AI Design Agent Workspace
- **Features**:
  - Create prototypes, websites, apps, dashboards
  - AI-powered design generation
  - Collaborative workspace
  - Presentation and image creation
- **Size**: ~250MB
- **Install Command**: `npm install -g @open-design/cli`

### 2. **Archify** (`archify`)
- **Repository**: https://github.com/tt-a1i/archify
- **Category**: Visualization
- **Description**: Turn ideas into beautiful interactive diagrams
- **Features**:
  - Architecture visualization
  - Multiple diagram types (workflow, dataflow, sequence)
  - Interactive diagrams
  - Export options
- **Size**: ~50MB
- **Install Command**: `npm install -g archify`

### 3. **Ruflo** (`ruflo`)
- **Repository**: https://github.com/ruvnet/ruflo
- **Category**: AI Agents
- **Description**: Agent meta-harness for multi-player swarms
- **Features**:
  - Multi-agent swarms
  - Autonomous workflows
  - Adaptive memory
  - Federation support
  - Vector RAG integration
- **Size**: ~180MB
- **Install Command**: `npm install -g ruflo`

### 4. **OpenViking** (`openviking`)
- **Repository**: https://github.com/volcengine/OpenViking
- **Category**: Database
- **Description**: Self-evolving Context Database for AI Agents
- **Features**:
  - Agent memory management
  - Knowledge RAG (Retrieval-Augmented Generation)
  - Skills integration
  - Vector database
  - Self-evolving context
- **Size**: ~300MB
- **Install Command**: `npm install -g @volcengine/openviking`

### 5. **DeepSeek-Reasonix** (`deepseek-reasonix`)
- **Repository**: https://github.com/esengine/DeepSeek-Reasonix
- **Category**: AI Models
- **Description**: Advanced reasoning extension for DeepSeek models
- **Features**:
  - Enhanced reasoning capabilities
  - Chain-of-thought processing
  - Complex problem solving
  - DeepSeek model integration
- **Size**: ~120MB
- **Install Command**: `npm install -g deepseek-reasonix`

### 6. **DSH Desktop** (`dsh-desktop`)
- **Repository**: https://github.com/anywhere-labs/dsh-desktop
- **Category**: Desktop
- **Description**: DeepSeek Harness Desktop - Full-featured desktop environment
- **Features**:
  - Complete desktop application
  - Multi-model support
  - Tool integration
  - Browser automation
- **Size**: ~400MB
- **Install Command**: `npm install -g @anywhere-labs/dsh-desktop`

### 7. **NocoBase** (`nocobase`)
- **Repository**: https://github.com/nocobase/nocobase
- **Category**: No-Code
- **Description**: No-code platform for building applications
- **Features**:
  - No-code app builder
  - Database management
  - API generation
  - Workflow automation
- **Size**: ~350MB
- **Install Command**: `npm install -g nocobase`

### 8. **DSH Free Model** (`dsh-free-model`)
- **Repository**: https://github.com/Ebony-Vinyl/dsh-our-free-model
- **Category**: AI Models
- **Description**: Free model access for DeepSeek Harness
- **Features**:
  - Free tier access
  - Model switching
  - Usage tracking
  - Cost optimization
- **Size**: ~80MB
- **Install Command**: `npm install -g dsh-free-model`

## Architecture

### Plugin Manager (`electron/services/PluginManager.js`)

The PluginManager handles all plugin operations:

```javascript
class PluginManager {
  constructor(userDataPath)
  async init()
  getAvailablePlugins()
  async installPlugin(pluginId)
  async uninstallPlugin(pluginId)
  getInstalledPlugins()
  isPluginInstalled(pluginId)
  getPluginInfo(pluginId)
  async updatePlugin(pluginId)
  async executePluginCommand(pluginId, command, args)
}
```

### Installation Process

1. **Clone Repository**: Downloads the plugin source code from GitHub
2. **Install Dependencies**: Runs `npm install` if package.json exists
3. **Run Install Command**: Executes the plugin-specific install command
4. **Update Registry**: Saves plugin information to registry.json

### IPC Handlers

The plugin system exposes these IPC channels:

- `plugins:getAvailable` - Get list of available plugins
- `plugins:getInstalled` - Get list of installed plugins
- `plugins:install` - Install a plugin
- `plugins:uninstall` - Uninstall a plugin
- `plugins:update` - Update a plugin
- `plugins:isInstalled` - Check if plugin is installed
- `plugins:getInfo` - Get plugin information
- `plugins:executeCommand` - Execute plugin command

### Preload API

The plugin API is exposed to the renderer process:

```javascript
window.deepseek.plugins = {
  getAvailable: () => Promise<Plugin[]>,
  getInstalled: () => Promise<Plugin[]>,
  install: (pluginId: string) => Promise<void>,
  uninstall: (pluginId: string) => Promise<void>,
  update: (pluginId: string) => Promise<void>,
  isInstalled: (pluginId: string) => Promise<boolean>,
  getInfo: (pluginId: string) => Promise<Plugin | null>,
  executeCommand: (pluginId: string, command: string, args?: string[]) => Promise<any>
}
```

## User Interface

### Plugin Installer Component (`src/components/PluginInstaller.tsx`)

The PluginInstaller provides a modern, responsive UI for managing plugins:

**Features**:
- Grid view of available plugins
- Plugin details modal
- Install/Uninstall/Update buttons
- Loading states and error handling
- Installed plugins list
- Category filtering
- Feature tags

**UI Components**:
- Plugin cards with icons and metadata
- Modal dialogs for detailed information
- Action buttons with loading states
- Error banners for user feedback
- Responsive grid layout

## Usage

### Installing a Plugin

1. Open the DeepSeek Desktop application
2. Navigate to the "Plugins" section in the sidebar
3. Browse available plugins
4. Click on a plugin card to view details
5. Click "Install Plugin" button
6. Wait for installation to complete
7. Plugin is now available in the "Installed Plugins" section

### Updating a Plugin

1. Go to the "Plugins" section
2. Find the installed plugin
3. Click the "Update" button
4. Wait for update to complete

### Uninstalling a Plugin

1. Go to the "Plugins" section
2. Find the installed plugin
3. Click the "Uninstall" button
4. Confirm the uninstallation

### Using Plugin Commands

```javascript
// Execute a plugin command
const result = await window.deepseek.plugins.executeCommand(
  'archify',
  'generate',
  ['--type', 'workflow', '--input', 'diagram.json']
);
```

## File Structure

```
electron/
├── services/
│   └── PluginManager.js          # Plugin management service
├── ipc-handlers.js               # IPC handlers (updated)
├── preload.js                    # Preload script (updated)
└── main.js                       # Main process (updated)

src/
├── components/
│   └── PluginInstaller.tsx       # Plugin UI component
└── App.tsx                       # Main app (updated)

userData/
└── plugins/
    ├── registry.json             # Plugin registry
    ├── open-design/              # Installed plugin
    ├── archify/                  # Installed plugin
    └── ...                       # Other plugins
```

## Configuration

### Plugin Registry (`registry.json`)

```json
[
  {
    "id": "archify",
    "name": "Archify",
    "description": "...",
    "repo": "https://github.com/tt-a1i/archify",
    "version": "v3.1.0",
    "category": "visualization",
    "size": "~50MB",
    "installCommand": "npm install -g archify",
    "features": ["..."],
    "installedAt": "2024-01-15T10:30:00.000Z",
    "path": "/path/to/userData/plugins/archify",
    "status": "installed"
  }
]
```

## Security Considerations

1. **Repository Verification**: Only install plugins from trusted GitHub repositories
2. **Command Execution**: Plugin install commands are executed in isolated environments
3. **Permission Checks**: User confirmation required for uninstallation
4. **Registry Integrity**: Plugin registry is stored in user data directory

## Troubleshooting

### Plugin Installation Fails

**Symptoms**: Error message during installation

**Solutions**:
1. Check internet connection
2. Verify GitHub repository is accessible
3. Check npm is installed and in PATH
4. Review error logs in developer console
5. Try manual installation via command line

### Plugin Not Showing in List

**Symptoms**: Installed plugin doesn't appear

**Solutions**:
1. Refresh the plugin list
2. Check registry.json file exists
3. Verify plugin directory exists in userData/plugins
4. Restart the application

### Plugin Command Fails

**Symptoms**: Error when executing plugin command

**Solutions**:
1. Verify plugin is fully installed
2. Check plugin documentation for correct command syntax
3. Review error output for specific issues
4. Try running command manually in terminal

## Development

### Adding a New Plugin

1. Add plugin definition to `PluginManager.getAvailablePlugins()`
2. Include all required metadata:
   - id, name, description
   - repo URL
   - version, category, size
   - installCommand
   - features array

### Testing Plugin Installation

```javascript
// Test in renderer console
const plugins = await window.deepseek.plugins.getAvailable();
console.log('Available plugins:', plugins);

await window.deepseek.plugins.install('archify');
const installed = await window.deepseek.plugins.getInstalled();
console.log('Installed plugins:', installed);
```

## Future Enhancements

1. **Plugin Marketplace**: Central repository for community plugins
2. **Version Management**: Automatic update checking
3. **Dependency Resolution**: Handle plugin dependencies
4. **Plugin Sandboxing**: Isolated execution environments
5. **Custom Plugin Sources**: Support for private repositories
6. **Plugin Configuration**: UI for plugin-specific settings
7. **Plugin Analytics**: Usage tracking and metrics
8. **Plugin Hooks**: Lifecycle events for plugins

## API Reference

### PluginManager Methods

#### `getAvailablePlugins()`
Returns array of all available plugins with metadata.

#### `getInstalledPlugins()`
Returns array of installed plugins with installation info.

#### `installPlugin(pluginId: string)`
Installs a plugin by ID. Returns plugin data on success.

#### `uninstallPlugin(pluginId: string)`
Removes a plugin and its files. Returns true on success.

#### `updatePlugin(pluginId: string)`
Updates a plugin to latest version. Returns updated plugin data.

#### `isPluginInstalled(pluginId: string)`
Returns boolean indicating if plugin is installed.

#### `getPluginInfo(pluginId: string)`
Returns detailed plugin information.

#### `executePluginCommand(pluginId: string, command: string, args?: string[])`
Executes a command in the plugin directory. Returns command output.

## License

This plugin system is part of the DeepSeek Desktop application and follows the same license.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review plugin documentation
3. Check GitHub repository issues
4. Open an issue in the DeepSeek Desktop repository
