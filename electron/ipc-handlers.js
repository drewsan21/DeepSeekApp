const { ipcMain } = require('electron');

// Mock data for demonstration
let mockAuth = { authenticated: false, account: null };
let mockTabs = [];
let mockActiveTab = null;
let mockProviders = [
  { id: 'deepseek-api', label: 'DeepSeek API', connected: false },
  { id: 'deepseek-account', label: 'DeepSeek Account', connected: false },
  { id: 'qwen-account', label: 'Qwen Account', connected: false },
  { id: 'qwen-local', label: 'Qwen Local', connected: false },
  { id: 'custom-openai', label: 'Custom OpenAI', connected: false },
  { id: 'local-model', label: 'Local Model', connected: false },
];
let mockPermissions = {};

function registerIpcHandlers(mainWindow) {
  // Helper to send events to renderer
  const sendToRenderer = (channel, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }
  };

  // Auth handlers
  ipcMain.handle('auth:login', async () => {
    // Mock login - in real app, this would open auth window
    mockAuth = { authenticated: true, account: { email: 'user@example.com' } };
    return true;
  });

  ipcMain.handle('auth:logout', async () => {
    mockAuth = { authenticated: false, account: null };
    return true;
  });

  ipcMain.handle('auth:status', async () => {
    return mockAuth;
  });

  // Provider handlers
  ipcMain.handle('providers:list', async () => {
    return mockProviders;
  });

  ipcMain.handle('providers:select', async (event, providerId) => {
    console.log('Selected provider:', providerId);
    return true;
  });

  ipcMain.handle('providers:getConfig', async () => {
    return mockProviders;
  });

  ipcMain.handle('providers:configure', async (event, config) => {
    const provider = mockProviders.find(p => p.id === config.id);
    if (provider) {
      provider.connected = true;
    }
    return true;
  });

  // Harness handlers
  ipcMain.handle('harness:start', async (event, request) => {
    // Simulate harness streaming
    setTimeout(() => {
      sendToRenderer('harness:event', { type: 'thinking',  'Processing request...' });
    }, 500);

    setTimeout(() => {
      sendToRenderer('harness:event', { type: 'message',  'This is a mock response from the harness.' });
    }, 1500);

    setTimeout(() => {
      sendToRenderer('harness:event', { type: 'completed' });
    }, 2000);

    return { started: true };
  });

  ipcMain.handle('harness:stop', async () => {
    return true;
  });

  // Browser handlers
  ipcMain.handle('browser:open', async (event, url) => {
    const tabId = `tab-${Date.now()}`;
    const tab = {
      id: tabId,
      url: url,
      title: url,
      loading: true,
    };
    mockTabs.push(tab);
    mockActiveTab = tabId;

    // Simulate loading
    setTimeout(() => {
      tab.loading = false;
      tab.title = 'Example Domain';
      sendToRenderer('browser:tab-updated', tab);
    }, 1000);

    return tabId;
  });

  ipcMain.handle('browser:new', async (event, url) => {
    return ipcMain.emit('browser:open', event, url);
  });

  ipcMain.handle('browser:list', async () => {
    return mockTabs;
  });

  ipcMain.handle('browser:active-tab', async () => {
    return mockActiveTab;
  });

  ipcMain.handle('browser:activate', async (event, tabId) => {
    mockActiveTab = tabId;
    return true;
  });

  ipcMain.handle('browser:close', async (event, tabId) => {
    mockTabs = mockTabs.filter(t => t.id !== tabId);
    if (mockActiveTab === tabId) {
      mockActiveTab = mockTabs.length > 0 ? mockTabs[0].id : null;
    }
    sendToRenderer('browser:tab-closed', { id: tabId });
    return true;
  });

  ipcMain.on('browser:set-bounds', (event, bounds) => {
    // In real app, this would resize the BrowserView
    console.log('Setting browser bounds:', bounds);
  });

  ipcMain.handle('browser:page-context', async (event, tabId) => {
    const tab = mockTabs.find(t => t.id === tabId);
    if (!tab) return null;

    return {
      url: tab.url,
      title: tab.title,
      selectedText: '',
      readableText: 'This is mock page content for demonstration purposes.',
    };
  });

  // Approval handlers
  ipcMain.handle('approval:respond', async (event, payload) => {
    console.log('Approval response:', payload);
    return true;
  });

  // Permission handlers
  ipcMain.handle('permissions:listSites', async () => {
    return Object.entries(mockPermissions).map(([origin, permissions]) => ({
      origin,
      permissions,
      updatedAt: Date.now(),
    }));
  });

  ipcMain.handle('permissions:getSite', async (event, origin) => {
    return mockPermissions[origin] || ['read_page', 'read_selection'];
  });

  ipcMain.handle('permissions:setSite', async (event, payload) => {
    mockPermissions[payload.origin] = payload.permissions;
    return true;
  });

  ipcMain.handle('permissions:resetSite', async (event, origin) => {
    delete mockPermissions[origin];
    return true;
  });

  ipcMain.handle('permissions:request', async (event, permission) => {
    // In real app, this would show a permission dialog
    return false;
  });
}

module.exports = { registerIpcHandlers };
