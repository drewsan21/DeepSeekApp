/**
 * Plugin Manager - Handles installation and management of external plugins
 * Integrates: open-design, archify, ruflo, OpenViking, DeepSeek-Reasonix, 
 *             dsh-desktop, nocobase, dsh-our-free-model
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

class PluginManager {
  constructor(userDataPath) {
    this.pluginsPath = path.join(userDataPath, 'plugins');
    this.registryPath = path.join(this.pluginsPath, 'registry.json');
    this.plugins = new Map();
    this.init();
  }

  async init() {
    // Ensure plugins directory exists
    await fs.mkdir(this.pluginsPath, { recursive: true });
    
    // Load plugin registry
    try {
      const data = await fs.readFile(this.registryPath, 'utf-8');
      const registry = JSON.parse(data);
      registry.forEach(plugin => {
        this.plugins.set(plugin.id, plugin);
      });
    } catch (error) {
      // Registry doesn't exist yet, that's okay
      console.log('Creating new plugin registry');
    }
  }

  /**
   * Get list of available plugins
   */
  getAvailablePlugins() {
    return [
      {
        id: 'open-design',
        name: 'OpenDesign',
        description: 'Collaborative AI Design Agent Workspace - Create prototypes, websites, apps, dashboards',
        repo: 'https://github.com/nexu-io/open-design',
        version: 'latest',
        category: 'design',
        size: '~250MB',
        installCommand: 'npm install -g @open-design/cli',
        features: ['AI-powered design', 'Collaborative workspace', 'Prototype generation', 'Website builder']
      },
      {
        id: 'archify',
        name: 'Archify',
        description: 'Turn ideas into beautiful interactive diagrams - Architecture visualization tool',
        repo: 'https://github.com/tt-a1i/archify',
        version: 'v3.1.0',
        category: 'visualization',
        size: '~50MB',
        installCommand: 'npm install -g archify',
        features: ['Interactive diagrams', 'Architecture visualization', 'Multiple diagram types', 'Export options']
      },
      {
        id: 'ruflo',
        name: 'Ruflo',
        description: 'Agent meta-harness for multi-player swarms and autonomous workflows',
        repo: 'https://github.com/ruvnet/ruflo',
        version: 'latest',
        category: 'ai-agents',
        size: '~180MB',
        installCommand: 'npm install -g ruflo',
        features: ['Multi-agent swarms', 'Autonomous workflows', 'Adaptive memory', 'Federation support']
      },
      {
        id: 'openviking',
        name: 'OpenViking',
        description: 'Self-evolving Context Database for AI Agents - Memory, Knowledge RAG and Skills',
        repo: 'https://github.com/volcengine/OpenViking',
        version: 'latest',
        category: 'database',
        size: '~300MB',
        installCommand: 'npm install -g @volcengine/openviking',
        features: ['Vector RAG', 'Agent memory', 'Knowledge base', 'Self-evolving context']
      },
      {
        id: 'deepseek-reasonix',
        name: 'DeepSeek-Reasonix',
        description: 'Advanced reasoning extension for DeepSeek models',
        repo: 'https://github.com/esengine/DeepSeek-Reasonix',
        version: 'latest',
        category: 'ai-models',
        size: '~120MB',
        installCommand: 'npm install -g deepseek-reasonix',
        features: ['Enhanced reasoning', 'Chain-of-thought', 'Complex problem solving']
      },
      {
        id: 'dsh-desktop',
        name: 'DSH Desktop',
        description: 'DeepSeek Harness Desktop - Full-featured desktop environment',
        repo: 'https://github.com/anywhere-labs/dsh-desktop',
        version: 'latest',
        category: 'desktop',
        size: '~400MB',
        installCommand: 'npm install -g @anywhere-labs/dsh-desktop',
        features: ['Complete desktop app', 'Multi-model support', 'Tool integration', 'Browser automation']
      },
      {
        id: 'nocobase',
        name: 'NocoBase',
        description: 'No-code platform for building applications and workflows',
        repo: 'https://github.com/nocobase/nocobase',
        version: 'latest',
        category: 'no-code',
        size: '~350MB',
        installCommand: 'npm install -g nocobase',
        features: ['No-code app builder', 'Database management', 'API generation', 'Workflow automation']
      },
      {
        id: 'dsh-free-model',
        name: 'DSH Free Model',
        description: 'Free model access for DeepSeek Harness',
        repo: 'https://github.com/Ebony-Vinyl/dsh-our-free-model',
        version: 'latest',
        category: 'ai-models',
        size: '~80MB',
        installCommand: 'npm install -g dsh-free-model',
        features: ['Free tier access', 'Model switching', 'Usage tracking']
      }
    ];
  }

  /**
   * Install a plugin
   */
  async installPlugin(pluginId) {
    const availablePlugins = this.getAvailablePlugins();
    const plugin = availablePlugins.find(p => p.id === pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    console.log(`Installing plugin: ${plugin.name}`);
    
    try {
      // Create plugin directory
      const pluginDir = path.join(this.pluginsPath, pluginId);
      await fs.mkdir(pluginDir, { recursive: true });

      // Clone repository
      const cloneCmd = `git clone ${plugin.repo} ${pluginDir}`;
      await execAsync(cloneCmd);

      // Install dependencies if package.json exists
      const packageJsonPath = path.join(pluginDir, 'package.json');
      try {
        await fs.access(packageJsonPath);
        console.log('Installing dependencies...');
        await execAsync('npm install', { cwd: pluginDir });
      } catch (error) {
        console.log('No package.json found, skipping npm install');
      }

      // Run install command if specified
      if (plugin.installCommand) {
        console.log(`Running install command: ${plugin.installCommand}`);
        try {
          await execAsync(plugin.installCommand);
        } catch (error) {
          console.warn(`Install command failed: ${error.message}`);
        }
      }

      // Update registry
      const pluginData = {
        ...plugin,
        installedAt: new Date().toISOString(),
        path: pluginDir,
        status: 'installed'
      };

      this.plugins.set(pluginId, pluginData);
      await this.saveRegistry();

      console.log(`Plugin ${plugin.name} installed successfully`);
      return pluginData;

    } catch (error) {
      console.error(`Failed to install plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    console.log(`Uninstalling plugin: ${plugin.name}`);

    try {
      // Remove plugin directory
      await fs.rm(plugin.path, { recursive: true, force: true });

      // Remove from registry
      this.plugins.delete(pluginId);
      await this.saveRegistry();

      console.log(`Plugin ${plugin.name} uninstalled successfully`);
      return true;

    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Get installed plugins
   */
  getInstalledPlugins() {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if plugin is installed
   */
  isPluginInstalled(pluginId) {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugin info
   */
  getPluginInfo(pluginId) {
    return this.plugins.get(pluginId);
  }

  /**
   * Update plugin
   */
  async updatePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    console.log(`Updating plugin: ${plugin.name}`);

    try {
      // Pull latest changes
      await execAsync('git pull', { cwd: plugin.path });

      // Reinstall dependencies
      const packageJsonPath = path.join(plugin.path, 'package.json');
      try {
        await fs.access(packageJsonPath);
        await execAsync('npm install', { cwd: plugin.path });
      } catch (error) {
        console.log('No package.json found, skipping npm install');
      }

      // Update registry
      plugin.updatedAt = new Date().toISOString();
      this.plugins.set(pluginId, plugin);
      await this.saveRegistry();

      console.log(`Plugin ${plugin.name} updated successfully`);
      return plugin;

    } catch (error) {
      console.error(`Failed to update plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /**
   * Save registry to disk
   */
  async saveRegistry() {
    const registry = Array.from(this.plugins.values());
    await fs.writeFile(this.registryPath, JSON.stringify(registry, null, 2));
  }

  /**
   * Execute plugin command
   */
  async executePluginCommand(pluginId, command, args = []) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    const fullCommand = `${command} ${args.join(' ')}`;
    
    try {
      const { stdout, stderr } = await execAsync(fullCommand, { 
        cwd: plugin.path,
        env: { ...process.env, PLUGIN_ID: pluginId }
      });

      return {
        success: true,
        stdout,
        stderr
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = { PluginManager };
