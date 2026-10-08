// ============================================================================
// System Tray - Background operation and quick access
// ============================================================================

import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'path';

export class SystemTray {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow | null = null;

  constructor() {}

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  create() {
    // Create tray icon
    // In production, use actual icon file
    const iconPath = path.join(__dirname, '../../packaging/icons/tray-icon.png');
    
    // For development, create a simple icon
    const icon = nativeImage.createEmpty();
    
    this.tray = new Tray(icon);
    this.tray.setToolTip('DeepSeek Desktop');

    // Create context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show DeepSeek Desktop',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'New Task',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
            this.mainWindow.webContents.send('new-task');
          }
        }
      },
      {
        label: 'Open Browser',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.show();
            this.mainWindow.focus();
            this.mainWindow.webContents.send('open-browser');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Check for Updates',
        click: () => {
          if (this.mainWindow) {
            this.mainWindow.webContents.send('check-updates');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);

    // Handle tray click
    this.tray.on('click', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      }
    });

    // Handle double-click
    this.tray.on('double-click', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  updateTooltip(text: string) {
    if (this.tray) {
      this.tray.setToolTip(text);
    }
  }

  showNotification(title: string, body: string) {
    if (this.tray) {
      this.tray.displayBalloon({
        title,
        content: body,
      });
    }
  }
}
