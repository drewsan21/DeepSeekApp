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
});
