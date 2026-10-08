const { ipcMain } = require('electron');
const { DeepSeekClient } = require('../src/services/DeepSeekClient');
const { QwenClient } = require('../src/services/QwenClient');

// Real API clients
let deepseekClient = null;
let qwenClient = null;

// Auth state
let authState = { authenticated: false, account: null };

// Provider configurations
let providerConfigs = [
  { id: 'deepseek-api', label: 'DeepSeek API', connected: false, apiKey: null },
  { id: 'deepseek-account', label: 'DeepSeek Account', connected: false },
  { id: 'qwen-account', label: 'Qwen Account', connected: false, apiKey: null },
  { id: 'qwen-local', label: 'Qwen Local', connected: false },
  { id: 'custom-openai', label: 'Custom OpenAI', connected: false, apiKey: null, baseUrl: null },
  { id: 'local-model', label: 'Local Model', connected: false, baseUrl: null },
];

function registerIpcHandlers(mainWindow, browserEngine, toolExecutor) {
  // Helper to send events to renderer
  const sendToRenderer = (channel, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data);
    }
  };

  // ============================================================================
  // Auth handlers
  // ============================================================================

  ipcMain.handle('auth:login', async () => {
    // In production, this would open an OAuth window
    // For now, simulate successful login
    authState = { authenticated: true, account: { email: 'user@example.com' } };
    return true;
  });

  ipcMain.handle('auth:logout', async () => {
    authState = { authenticated: false, account: null };
    deepseekClient = null;
    qwenClient = null;
    return true;
  });

  ipcMain.handle('auth:status', async () => {
    return authState;
  });

  // ============================================================================
  // Provider handlers
  // ============================================================================

  ipcMain.handle('providers:list', async () => {
    return providerConfigs.map(p => ({
      id: p.id,
      label: p.label,
      connected: p.connected
    }));
  });

  ipcMain.handle('providers:select', async (event, providerId) => {
    console.log('Selected provider:', providerId);
    return true;
  });

  ipcMain.handle('providers:getConfig', async () => {
    return providerConfigs;
  });

  ipcMain.handle('providers:configure', async (event, config) => {
    const provider = providerConfigs.find(p => p.id === config.id);
    if (provider) {
      if (config.apiKey) {
        provider.apiKey = config.apiKey;
        provider.connected = true;

        // Initialize real API client
        if (config.id === 'deepseek-api') {
          deepseekClient = new DeepSeekClient({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl
          });
        } else if (config.id === 'qwen-account') {
          qwenClient = new QwenClient({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl
          });
        }
      }
      if (config.baseUrl) {
        provider.baseUrl = config.baseUrl;
      }
    }
    return true;
  });

  // ============================================================================
  // Harness handlers - REAL AI API INTEGRATION
  // ============================================================================

  ipcMain.handle('harness:start', async (event, request) => {
    const { providerId, model, prompt, context } = request;

    try {
      // Determine which client to use
      let client = null;
      if (providerId === 'deepseek-api' && deepseekClient) {
        client = deepseekClient;
      } else if (providerId === 'qwen-account' && qwenClient) {
        client = qwenClient;
      }

      if (!client) {
        sendToRenderer('harness:event', {
          type: 'error',
          message: 'No API client configured. Please configure API keys in settings.'
        });
        return { started: false };
      }

      sendToRenderer('harness:event', { type: 'thinking',  'Connecting to API...' });

      // Prepare messages
      const messages = [];
      if (context) {
        messages.push({
          role: 'system',
          content: `You are a helpful AI assistant. The user is viewing a web page.\n\nPage URL: ${context.url}\nPage Title: ${context.title}\n\n${context.readableText ? 'Page Content:\n' + context.readableText.substring(0, 5000) : ''}`
        });
      }
      messages.push({ role: 'user', content: prompt });

      // Stream response
      sendToRenderer('harness:event', { type: 'thinking',  'Processing request...' });

      const stream = client.chatStream(messages, {
        temperature: 0.7,
        max_tokens: 2000
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          fullResponse += content;
          sendToRenderer('harness:event', { type: 'message',  content });
        }
      }

      sendToRenderer('harness:event', { type: 'completed' });
      return { started: true, response: fullResponse };

    } catch (error) {
      sendToRenderer('harness:event', {
        type: 'error',
        message: error.message || 'API request failed'
      });
      return { started: false, error: error.message };
    }
  });

  ipcMain.handle('harness:stop', async () => {
    // In production, would cancel the ongoing request
    return true;
  });

  // ============================================================================
  // Browser handlers - REAL BROWSER ENGINE
  // ============================================================================

  ipcMain.handle('browser:open', async (event, url) => {
    const tabId = browserEngine.createTab(url);
    return tabId;
  });

  ipcMain.handle('browser:new', async (event, url) => {
    const tabId = browserEngine.createTab(url);
    return tabId;
  });

  ipcMain.handle('browser:list', async () => {
    return browserEngine.getTabInfo();
  });

  ipcMain.handle('browser:active-tab', async () => {
    const tab = browserEngine.getActiveTab();
    return tab ? tab.id : null;
  });

  ipcMain.handle('browser:activate', async (event, tabId) => {
    browserEngine.setActiveTab(tabId);
    return true;
  });

  ipcMain.handle('browser:close', async (event, tabId) => {
    browserEngine.closeTab(tabId);
    return true;
  });

  ipcMain.handle('browser:navigate', async (event, url) => {
    browserEngine.navigate(url);
    return true;
  });

  ipcMain.handle('browser:back', async () => {
    browserEngine.goBack();
    return true;
  });

  ipcMain.handle('browser:forward', async () => {
    browserEngine.goForward();
    return true;
  });

  ipcMain.handle('browser:reload', async () => {
    browserEngine.reload();
    return true;
  });

  ipcMain.handle('browser:page-context', async (event, tabId) => {
    const context = await browserEngine.extractPageContext();
    return context;
  });

  ipcMain.handle('browser:screenshot', async () => {
    const screenshot = await browserEngine.takeScreenshot();
    return screenshot;
  });

  ipcMain.handle('browser:execute-js', async (event, code) => {
    const result = await browserEngine.executeJavaScript(code);
    return result;
  });

  ipcMain.handle('browser:find', async (event, text) => {
    browserEngine.findInPage(text);
    return true;
  });

  ipcMain.handle('browser:stop-find', async () => {
    browserEngine.stopFindInPage();
    return true;
  });

  ipcMain.handle('browser:set-zoom', async (event, level) => {
    browserEngine.setZoomLevel(level);
    return true;
  });

  ipcMain.on('browser:set-bounds', (event, bounds) => {
    browserEngine.setBounds(bounds);
  });

  // ============================================================================
  // Tool execution handlers - REAL TOOL EXECUTION
  // ============================================================================

  ipcMain.handle('tool:execute', async (event, toolName, args) => {
    const result = await toolExecutor.execute(toolName, args);
    return result;
  });

  ipcMain.handle('tool:list', async () => {
    return [
      // Computer Use
      { name: 'computer_use.click', category: 'computer-use', description: 'Simulate mouse click' },
      { name: 'computer_use.type', category: 'computer-use', description: 'Simulate keyboard typing' },
      { name: 'computer_use.screenshot', category: 'computer-use', description: 'Take screenshot' },
      { name: 'computer_use.scroll', category: 'computer-use', description: 'Simulate scroll' },
      { name: 'computer_use.key', category: 'computer-use', description: 'Simulate key press' },

      // File System
      { name: 'filesystem.read', category: 'filesystem', description: 'Read file contents' },
      { name: 'filesystem.write', category: 'filesystem', description: 'Write file contents' },
      { name: 'filesystem.list', category: 'filesystem', description: 'List directory contents' },
      { name: 'filesystem.delete', category: 'filesystem', description: 'Delete file or directory' },
      { name: 'filesystem.mkdir', category: 'filesystem', description: 'Create directory' },
      { name: 'filesystem.copy', category: 'filesystem', description: 'Copy file or directory' },
      { name: 'filesystem.move', category: 'filesystem', description: 'Move file or directory' },
      { name: 'filesystem.stats', category: 'filesystem', description: 'Get file stats' },

      // Git
      { name: 'git.status', category: 'git', description: 'Get git status' },
      { name: 'git.commit', category: 'git', description: 'Commit changes' },
      { name: 'git.push', category: 'git', description: 'Push to remote' },
      { name: 'git.pull', category: 'git', description: 'Pull from remote' },
      { name: 'git.branch', category: 'git', description: 'Manage branches' },
      { name: 'git.log', category: 'git', description: 'View commit history' },

      // Utility
      { name: 'utility.screenshot', category: 'utility', description: 'Take screenshot' },
      { name: 'utility.clipboard_read', category: 'utility', description: 'Read clipboard' },
      { name: 'utility.clipboard_write', category: 'utility', description: 'Write to clipboard' },
      { name: 'utility.notification', category: 'utility', description: 'Show notification' },
      { name: 'utility.open_url', category: 'utility', description: 'Open URL in browser' },
      { name: 'utility.system_info', category: 'utility', description: 'Get system info' }
    ];
  });

  // ============================================================================
  // Approval handlers
  // ============================================================================

  ipcMain.handle('approval:respond', async (event, payload) => {
    console.log('Approval response:', payload);
    // In production, would handle approval logic
    return true;
  });

  // ============================================================================
  // Permission handlers
  // ============================================================================

  ipcMain.handle('permissions:listSites', async () => {
    // In production, would load from persistent storage
    return [];
  });

  ipcMain.handle('permissions:getSite', async (event, origin) => {
    return ['read_page', 'read_selection'];
  });

  ipcMain.handle('permissions:setSite', async (event, payload) => {
    // In production, would save to persistent storage
    return true;
  });

  ipcMain.handle('permissions:resetSite', async (event, origin) => {
    return true;
  });

  ipcMain.handle('permissions:request', async (event, permission) => {
    // In production, would show permission dialog
    return false;
  });
}

module.exports = { registerIpcHandlers };
