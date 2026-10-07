import { app, BrowserWindow } from 'electron';
import path from 'path';
import { LinuxSecretStore } from '@deepseek/secrets';
import { AuthManager } from '@deepseek/auth';
import { DeepSeekHarnessAdapter } from '@deepseek/harness';
import { BrowserManager } from '@deepseek/browser';
import { PermissionManager } from './services/PermissionManager';
import { ProviderConfigManager } from './services/ProviderConfigManager';
import { registerIpc } from './ipc';

let mainWindow: BrowserWindow | null = null;

async function bootstrap() {
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

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  }
}

bootstrap();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
