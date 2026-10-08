const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('deepseek', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Auth (real implementation)
  auth: {
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    status: () => ipcRenderer.invoke('auth:status'),
  },
  
  // Providers (real implementation)
  providers: {
    list: () => ipcRenderer.invoke('providers:list'),
    select: (providerId) => ipcRenderer.invoke('providers:select', providerId),
    getConfig: () => ipcRenderer.invoke('providers:getConfig'),
    configure: (config) => ipcRenderer.invoke('providers:configure', config),
  },
  
  // Harness (real AI API integration)
  harness: {
    start: (request) => ipcRenderer.invoke('harness:start', request),
    stop: () => ipcRenderer.invoke('harness:stop'),
    onStream: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('harness:event', listener);
      return () => ipcRenderer.removeListener('harness:event', listener);
    },
  },
  
  // Browser (real browser engine)
  browser: {
    open: (url) => ipcRenderer.invoke('browser:open', url),
    newTab: (url) => ipcRenderer.invoke('browser:new', url),
    listTabs: () => ipcRenderer.invoke('browser:list'),
    getActiveTab: () => ipcRenderer.invoke('browser:active-tab'),
    activateTab: (tabId) => ipcRenderer.invoke('browser:activate', tabId),
    closeTab: (tabId) => ipcRenderer.invoke('browser:close', tabId),
    navigate: (url) => ipcRenderer.invoke('browser:navigate', url),
    back: () => ipcRenderer.invoke('browser:back'),
    forward: () => ipcRenderer.invoke('browser:forward'),
    reload: () => ipcRenderer.invoke('browser:reload'),
    setBounds: (bounds) => ipcRenderer.send('browser:set-bounds', bounds),
    getPageContext: (tabId) => ipcRenderer.invoke('browser:page-context', tabId),
    takeScreenshot: () => ipcRenderer.invoke('browser:screenshot'),
    executeJavaScript: (code) => ipcRenderer.invoke('browser:execute-js', code),
    findInPage: (text) => ipcRenderer.invoke('browser:find', text),
    stopFindInPage: () => ipcRenderer.invoke('browser:stop-find'),
    setZoomLevel: (level) => ipcRenderer.invoke('browser:set-zoom', level),
    onTabUpdated: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('browser:tab-updated', listener);
      return () => ipcRenderer.removeListener('browser:tab-updated', listener);
    },
    onTabClosed: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('browser:tab-closed', listener);
      return () => ipcRenderer.removeListener('browser:tab-closed', listener);
    },
    onActiveTabChanged: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('browser:active-tab-changed', listener);
      return () => ipcRenderer.removeListener('browser:active-tab-changed', listener);
    },
  },
  
  // Tool execution (real tool execution)
  tools: {
    execute: (toolName, args) => ipcRenderer.invoke('tool:execute', toolName, args),
    list: () => ipcRenderer.invoke('tool:list'),
  },
  
  // Approvals
  approvals: {
    respond: (id, response) => ipcRenderer.invoke('approval:respond', { id, ...response }),
  },
  
  // Permissions
  permissions: {
    request: (permission) => ipcRenderer.invoke('permissions:request', permission),
    listSites: () => ipcRenderer.invoke('permissions:listSites'),
    getSite: (origin) => ipcRenderer.invoke('permissions:getSite', origin),
    setSite: (origin, permissions) => ipcRenderer.invoke('permissions:setSite', { origin, permissions }),
    resetSite: (origin) => ipcRenderer.invoke('permissions:resetSite', origin),
  },

  // Conversations - REAL PERSISTENT STORAGE
  conversations: {
    create: (title, providerId, model, metadata) => 
      ipcRenderer.invoke('conversation:create', title, providerId, model, metadata),
    get: (id) => ipcRenderer.invoke('conversation:get', id),
    getAll: () => ipcRenderer.invoke('conversation:getAll'),
    getWithMessages: (id) => ipcRenderer.invoke('conversation:getWithMessages', id),
    updateTitle: (id, title) => ipcRenderer.invoke('conversation:updateTitle', id, title),
    delete: (id) => ipcRenderer.invoke('conversation:delete', id),
    addMessage: (conversationId, role, content, metadata) => 
      ipcRenderer.invoke('conversation:addMessage', conversationId, role, content, metadata),
    getMessages: (conversationId) => ipcRenderer.invoke('conversation:getMessages', conversationId),
    search: (query) => ipcRenderer.invoke('conversation:search', query),
    getRecent: (limit) => ipcRenderer.invoke('conversation:getRecent', limit),
    getStats: () => ipcRenderer.invoke('conversation:getStats'),
    export: (id) => ipcRenderer.invoke('conversation:export', id),
    import: (data) => ipcRenderer.invoke('conversation:import', data),
    duplicate: (id) => ipcRenderer.invoke('conversation:duplicate', id),
  },

  // Workspaces - REAL PERSISTENT STORAGE
  workspaces: {
    create: (name, description, config) => 
      ipcRenderer.invoke('workspace:create', name, description, config),
    get: (id) => ipcRenderer.invoke('workspace:get', id),
    getAll: () => ipcRenderer.invoke('workspace:getAll'),
    getActive: () => ipcRenderer.invoke('workspace:getActive'),
    setActive: (id) => ipcRenderer.invoke('workspace:setActive', id),
    update: (id, updates) => ipcRenderer.invoke('workspace:update', id, updates),
    delete: (id) => ipcRenderer.invoke('workspace:delete', id),
    search: (query) => ipcRenderer.invoke('workspace:search', query),
    getStats: () => ipcRenderer.invoke('workspace:getStats'),
    export: (id) => ipcRenderer.invoke('workspace:export', id),
    import: (data) => ipcRenderer.invoke('workspace:import', data),
    duplicate: (id) => ipcRenderer.invoke('workspace:duplicate', id),
  },

  // Settings - REAL PERSISTENT STORAGE
  settings: {
    get: (key, defaultValue) => ipcRenderer.invoke('settings:get', key, defaultValue),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    reset: () => ipcRenderer.invoke('settings:reset'),
    getTheme: () => ipcRenderer.invoke('settings:getTheme'),
    setTheme: (theme) => ipcRenderer.invoke('settings:setTheme', theme),
    getDefaultProvider: () => ipcRenderer.invoke('settings:getDefaultProvider'),
    setDefaultProvider: (provider) => ipcRenderer.invoke('settings:setDefaultProvider', provider),
    isToolEnabled: (toolName) => ipcRenderer.invoke('settings:isToolEnabled', toolName),
    setToolEnabled: (toolName, enabled) => ipcRenderer.invoke('settings:setToolEnabled', toolName, enabled),
    getEnabledTools: () => ipcRenderer.invoke('settings:getEnabledTools'),
    getUISettings: () => ipcRenderer.invoke('settings:getUISettings'),
    setUISettings: (settings) => ipcRenderer.invoke('settings:setUISettings', settings),
    export: () => ipcRenderer.invoke('settings:export'),
    import: (settingsJson) => ipcRenderer.invoke('settings:import', settingsJson),
  },

  // Secrets - REAL SECURE STORAGE
  secrets: {
    set: (key, value) => ipcRenderer.invoke('secret:set', key, value),
    get: (key) => ipcRenderer.invoke('secret:get', key),
    delete: (key) => ipcRenderer.invoke('secret:delete', key),
    has: (key) => ipcRenderer.invoke('secret:has', key),
    setApiKey: (providerId, apiKey) => ipcRenderer.invoke('secret:setApiKey', providerId, apiKey),
    getApiKey: (providerId) => ipcRenderer.invoke('secret:getApiKey', providerId),
    deleteApiKey: (providerId) => ipcRenderer.invoke('secret:deleteApiKey', providerId),
    setOAuthToken: (provider, token) => ipcRenderer.invoke('secret:setOAuthToken', provider, token),
    getOAuthToken: (provider) => ipcRenderer.invoke('secret:getOAuthToken', provider),
    deleteOAuthToken: (provider) => ipcRenderer.invoke('secret:deleteOAuthToken', provider),
    clearAll: () => ipcRenderer.invoke('secret:clearAll'),
  },

  // Database
  database: {
    getStats: () => ipcRenderer.invoke('database:getStats'),
    vacuum: () => ipcRenderer.invoke('database:vacuum'),
  },
});
