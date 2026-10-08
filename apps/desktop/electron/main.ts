import { app, BrowserWindow } from 'electron';
import path from 'path';
import { LinuxSecretStore } from '@deepseek/secrets';
import { AuthManager } from '@deepseek/auth';
import { DeepSeekHarnessAdapter } from '@deepseek/harness';
import { BrowserManager } from '@deepseek/browser';
import { PermissionManager } from './services/PermissionManager';
import { ProviderConfigManager } from './services/ProviderConfigManager';
import { AutoUpdater } from './services/AutoUpdater';
import { SystemTray } from './services/SystemTray';
import { FileAssociationHandler } from './services/FileAssociationHandler';
import { StartupManager } from './services/StartupManager';
import { registerIpc } from './ipc';

let mainWindow: BrowserWindow | null = null;
let autoUpdater: AutoUpdater | null = null;
let systemTray: SystemTray | null = null;

async function bootstrap() {
  // Register file associations before app is ready
  FileAssociationHandler.registerFileAssociations();

  // Prevent multiple instances
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  await app.whenReady();

  const secrets = new LinuxSecretStore();
  const auth = new AuthManager(secrets);
  const harness = new DeepSeekHarnessAdapter();

  const permissions = new PermissionManager(app.getPath('userData'));
  await permissions.init();

  const providers = new ProviderConfigManager(app.getPath('userData'), secrets);
  await providers.init();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  const browser = new BrowserManager(mainWindow);

  registerIpc(mainWindow, {
    auth,
    harness,
    browser,
    permissions,
    providers
  });

  // Initialize auto-updater
  autoUpdater = new AutoUpdater();
  autoUpdater.setMainWindow(mainWindow);
  
  // Start periodic update checks (every hour)
  autoUpdater.startPeriodicCheck(60);

  // Initialize system tray
  systemTray = new SystemTray();
  systemTray.setMainWindow(mainWindow);
  systemTray.create();

  // Handle window close - minimize to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Handle file associations
  const fileHandler = new FileAssociationHandler();
  fileHandler.on('open-project', (filePath) => {
    mainWindow?.webContents.send('open-project', filePath);
  });
  fileHandler.on('open-document', (filePath) => {
    mainWindow?.webContents.send('open-document', filePath);
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  }
}

bootstrap();

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    bootstrap();
  } else {
    mainWindow.show();
  }
});

// Clean up on quit
app.on('before-quit', () => {
  if (autoUpdater) {
    autoUpdater.stopPeriodicCheck();
  }
  if (systemTray) {
    systemTray.destroy();
  }
});

// Extend app type to include isQuitting flag
declare module 'electron' {
  interface App {
    isQuitting: boolean;
  }
}

app.isQuitting = false;

app.on('before-quit', () => {
  app.isQuitting = true;
});
