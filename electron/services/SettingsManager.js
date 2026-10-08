/**
 * Settings Manager - Application settings storage using electron-store
 * Handles user preferences, UI settings, and configuration
 */

const Store = require('electron-store');

class SettingsManager {
  constructor() {
    this.store = new Store({
      name: 'settings',
      defaults: {
        // General settings
        theme: 'dark',
        language: 'en',
        autoUpdate: true,
        startMinimized: false,
        
        // Provider settings
        defaultProvider: 'deepseek-api',
        defaultModel: 'deepseek-chat',
        
        // Browser settings
        defaultSearchEngine: 'https://duckduckgo.com/?q=',
        blockPopups: true,
        enableJavaScript: true,
        
        // Tool settings
        enabledTools: {
          'filesystem.read': true,
          'filesystem.write': true,
          'filesystem.list': true,
          'filesystem.delete': true,
          'git.status': true,
          'git.commit': true,
          'git.push': true,
          'git.pull': true,
          'utility.open_url': true,
          'utility.system_info': true
        },
        
        // UI settings
        sidebarWidth: 250,
        fontSize: 14,
        showLineNumbers: true,
        wordWrap: true,
        
        // Notification settings
        enableNotifications: true,
        notifyOnComplete: true,
        notifyOnError: true,
        
        // Privacy settings
        sendAnalytics: false,
        shareCrashReports: false,
        
        // Advanced settings
        developerMode: false,
        logLevel: 'info',
        maxConversations: 100,
        maxMessagesPerConversation: 1000
      }
    });
  }

  /**
   * Get a setting value
   */
  get(key, defaultValue) {
    return this.store.get(key, defaultValue);
  }

  /**
   * Set a setting value
   */
  set(key, value) {
    this.store.set(key, value);
  }

  /**
   * Check if a setting exists
   */
  has(key) {
    return this.store.has(key);
  }

  /**
   * Delete a setting
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Get all settings
   */
  getAll() {
    return this.store.store;
  }

  /**
   * Reset all settings to defaults
   */
  reset() {
    this.store.clear();
  }

  /**
   * Get theme setting
   */
  getTheme() {
    return this.get('theme', 'dark');
  }

  /**
   * Set theme setting
   */
  setTheme(theme) {
    this.set('theme', theme);
  }

  /**
   * Get language setting
   */
  getLanguage() {
    return this.get('language', 'en');
  }

  /**
   * Set language setting
   */
  setLanguage(language) {
    this.set('language', language);
  }

  /**
   * Get default provider
   */
  getDefaultProvider() {
    return this.get('defaultProvider', 'deepseek-api');
  }

  /**
   * Set default provider
   */
  setDefaultProvider(provider) {
    this.set('defaultProvider', provider);
  }

  /**
   * Get default model
   */
  getDefaultModel() {
    return this.get('defaultModel', 'deepseek-chat');
  }

  /**
   * Set default model
   */
  setDefaultModel(model) {
    this.set('defaultModel', model);
  }

  /**
   * Check if a tool is enabled
   */
  isToolEnabled(toolName) {
    const enabledTools = this.get('enabledTools', {});
    return enabledTools[toolName] !== false;
  }

  /**
   * Enable/disable a tool
   */
  setToolEnabled(toolName, enabled) {
    const enabledTools = this.get('enabledTools', {});
    enabledTools[toolName] = enabled;
    this.set('enabledTools', enabledTools);
  }

  /**
   * Get all enabled tools
   */
  getEnabledTools() {
    const enabledTools = this.get('enabledTools', {});
    return Object.entries(enabledTools)
      .filter(([_, enabled]) => enabled)
      .map(([name, _]) => name);
  }

  /**
   * Get UI settings
   */
  getUISettings() {
    return {
      sidebarWidth: this.get('sidebarWidth', 250),
      fontSize: this.get('fontSize', 14),
      showLineNumbers: this.get('showLineNumbers', true),
      wordWrap: this.get('wordWrap', true)
    };
  }

  /**
   * Set UI settings
   */
  setUISettings(settings) {
    if (settings.sidebarWidth !== undefined) {
      this.set('sidebarWidth', settings.sidebarWidth);
    }
    if (settings.fontSize !== undefined) {
      this.set('fontSize', settings.fontSize);
    }
    if (settings.showLineNumbers !== undefined) {
      this.set('showLineNumbers', settings.showLineNumbers);
    }
    if (settings.wordWrap !== undefined) {
      this.set('wordWrap', settings.wordWrap);
    }
  }

  /**
   * Get notification settings
   */
  getNotificationSettings() {
    return {
      enableNotifications: this.get('enableNotifications', true),
      notifyOnComplete: this.get('notifyOnComplete', true),
      notifyOnError: this.get('notifyOnError', true)
    };
  }

  /**
   * Set notification settings
   */
  setNotificationSettings(settings) {
    if (settings.enableNotifications !== undefined) {
      this.set('enableNotifications', settings.enableNotifications);
    }
    if (settings.notifyOnComplete !== undefined) {
      this.set('notifyOnComplete', settings.notifyOnComplete);
    }
    if (settings.notifyOnError !== undefined) {
      this.set('notifyOnError', settings.notifyOnError);
    }
  }

  /**
   * Get privacy settings
   */
  getPrivacySettings() {
    return {
      sendAnalytics: this.get('sendAnalytics', false),
      shareCrashReports: this.get('shareCrashReports', false)
    };
  }

  /**
   * Set privacy settings
   */
  setPrivacySettings(settings) {
    if (settings.sendAnalytics !== undefined) {
      this.set('sendAnalytics', settings.sendAnalytics);
    }
    if (settings.shareCrashReports !== undefined) {
      this.set('shareCrashReports', settings.shareCrashReports);
    }
  }

  /**
   * Get advanced settings
   */
  getAdvancedSettings() {
    return {
      developerMode: this.get('developerMode', false),
      logLevel: this.get('logLevel', 'info'),
      maxConversations: this.get('maxConversations', 100),
      maxMessagesPerConversation: this.get('maxMessagesPerConversation', 1000)
    };
  }

  /**
   * Set advanced settings
   */
  setAdvancedSettings(settings) {
    if (settings.developerMode !== undefined) {
      this.set('developerMode', settings.developerMode);
    }
    if (settings.logLevel !== undefined) {
      this.set('logLevel', settings.logLevel);
    }
    if (settings.maxConversations !== undefined) {
      this.set('maxConversations', settings.maxConversations);
    }
    if (settings.maxMessagesPerConversation !== undefined) {
      this.set('maxMessagesPerConversation', settings.maxMessagesPerConversation);
    }
  }

  /**
   * Export all settings
   */
  exportSettings() {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import settings
   */
  importSettings(settingsJson) {
    try {
      const settings = JSON.parse(settingsJson);
      this.store.set(settings);
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  /**
   * Get settings file path
   */
  getSettingsPath() {
    return this.store.path;
  }
}

module.exports = { SettingsManager };
