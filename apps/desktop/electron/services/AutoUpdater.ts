// ============================================================================
// Auto-Updater - Automatic update checking and installation
// ============================================================================

import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow, dialog } from 'electron';
import { EventEmitter } from 'events';

export class AutoUpdater extends EventEmitter {
  private mainWindow: BrowserWindow | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupAutoUpdater();
  }

  private setupAutoUpdater() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
      this.emit('checking');
      console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      this.emit('available', info);
      console.log('Update available:', info.version);
      
      // Notify user
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-available', info);
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      this.emit('not-available', info);
      console.log('Update not available:', info.version);
    });

    autoUpdater.on('error', (error) => {
      this.emit('error', error);
      console.error('Auto-updater error:', error);
    });

    autoUpdater.on('download-progress', (progress) => {
      this.emit('progress', progress);
      console.log(`Download progress: ${progress.percent}%`);
      
      // Notify renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('download-progress', progress);
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.emit('downloaded', info);
      console.log('Update downloaded:', info.version);
      
      // Notify user
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('update-downloaded', info);
      }
    });
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
      this.emit('error', error);
    }
  }

  async downloadUpdate() {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('Failed to download update:', error);
      this.emit('error', error);
    }
  }

  async installUpdate() {
    autoUpdater.quitAndInstall();
  }

  startPeriodicCheck(intervalMinutes: number = 60) {
    // Check immediately
    this.checkForUpdates();

    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, intervalMinutes * 60 * 1000);
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async promptUserToUpdate(info: any): Promise<boolean> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return false;
    }

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available.`,
      detail: 'Would you like to download and install it?',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });

    return result.response === 0;
  }

  async promptUserToInstall(info: any): Promise<boolean> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return false;
    }

    const result = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded.`,
      detail: 'The application will restart to install the update.',
      buttons: ['Install and Restart', 'Later'],
      defaultId: 0,
      cancelId: 1,
    });

    return result.response === 0;
  }
}
