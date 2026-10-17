const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipc-handlers');
const { BrowserEngine } = require('./services/BrowserEngine');
const { ToolExecutor } = require('./services/ToolExecutor');
const { DatabaseManager } = require('./services/DatabaseManager');
const { SecretStore } = require('./services/SecretStore');
const { SettingsManager } = require('./services/SettingsManager');
const { ConversationManager } = require('./services/ConversationManager');
const { WorkspaceManager } = require('./services/WorkspaceManager');
const { PluginManager } = require('./services/PluginManager');
const { BridgeServer } = require('./services/BridgeServer');

let mainWindow;
let bridgeServer;
let browserEngine;
let toolExecutor;
let databaseManager;
let secretStore;
let settingsManager;
let conversationManager;
let workspaceManager;
let pluginManager;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Initialize storage managers
  const userDataPath = app.getPath('userData');
  databaseManager = new DatabaseManager(userDataPath);
  secretStore = new SecretStore();
  settingsManager = new SettingsManager();
  conversationManager = new ConversationManager(databaseManager);
  workspaceManager = new WorkspaceManager(databaseManager);
  pluginManager = new PluginManager(userDataPath);

  // Initialize real services
  browserEngine = new BrowserEngine(mainWindow);
  toolExecutor = new ToolExecutor();

  // Local bridge endpoint: exposed to other apps on this machine after login
  bridgeServer = new BridgeServer({
    toolExecutor,
    pluginManager,
    conversationManager,
    settings: settingsManager,
    secretStore,
  });

  // Register IPC handlers with all managers
  registerIpcHandlers(mainWindow, {
    browserEngine,
    toolExecutor,
    databaseManager,
    secretStore,
    settingsManager,
    conversationManager,
    workspaceManager,
    pluginManager,
    bridgeServer
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Ensure the local bridge endpoint is shut down when the app exits.
app.on('before-quit', () => {
  if (bridgeServer && bridgeServer.running) {
    bridgeServer.stop().catch(() => {});
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});
