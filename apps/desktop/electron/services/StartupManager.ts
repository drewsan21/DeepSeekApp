// ============================================================================
// Startup Manager - Handle app startup on login
// ============================================================================

import { app } from 'electron';

export class StartupManager {
  static async isEnabled(): Promise<boolean> {
    return app.getLoginItemSettings().openAtLogin;
  }

  static async enable(): Promise<void> {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true, // Start minimized to tray
    });
  }

  static async disable(): Promise<void> {
    app.setLoginItemSettings({
      openAtLogin: false,
    });
  }

  static async toggle(): Promise<boolean> {
    const isEnabled = await this.isEnabled();
    if (isEnabled) {
      await this.disable();
      return false;
    } else {
      await this.enable();
      return true;
    }
  }

  static getSettings() {
    return app.getLoginItemSettings();
  }
}
