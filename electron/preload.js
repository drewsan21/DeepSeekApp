const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('deepseek', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // Auth (mock implementation for now)
  auth: {
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    status: () => ipcRenderer.invoke('auth:status'),
  },
  
  // Providers
  providers: {
    list: () => ipcRenderer.invoke('providers:list'),
    select: (providerId) => ipcRenderer.invoke('providers:select', providerId),
    getConfig: () => ipcRenderer.invoke('providers:getConfig'),
    configure: (config) => ipcRenderer.invoke('providers:configure', config),
  },
  
  // Harness
  harness: {
    start: (request) => ipcRenderer.invoke('harness:start', request),
    stop: () => ipcRenderer.invoke('harness:stop'),
    onStream: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('harness:event', listener);
      return () => ipcRenderer.removeListener('harness:event', listener);
    },
  },
  
  // Browser
  browser: {
    open: (url) => ipcRenderer.invoke('browser:open', url),
    newTab: (url) => ipcRenderer.invoke('browser:new', url),
    listTabs: () => ipcRenderer.invoke('browser:list'),
    getActiveTab: () => ipcRenderer.invoke('browser:active-tab'),
    activateTab: (tabId) => ipcRenderer.invoke('browser:activate', tabId),
    closeTab: (tabId) => ipcRenderer.invoke('browser:close', tabId),
    setBounds: (bounds) => ipcRenderer.send('browser:set-bounds', bounds),
    getPageContext: (tabId) => ipcRenderer.invoke('browser:page-context', tabId),
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
    onContextAction: (callback) => {
      const listener = (event, data) => callback(data);
      ipcRenderer.on('browser:context-action', listener);
      return () => ipcRenderer.removeListener('browser:context-action', listener);
    },
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
