// ============================================================================
// Qwen Auth Manager - Handles Qwen account and local authentication
// ============================================================================

import { BrowserWindow, session } from 'electron';
import type { QwenAccountConfig, QwenLocalConfig, QwenStudioConfig } from '@deepseek/shared';

export interface SecretStore {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

export class QwenAuthManager {
  private authWindow: BrowserWindow | null = null;
  private partition = 'persist:qwen-auth';
  private allowedDomains = [
    'dashscope.aliyuncs.com',
    'account.aliyun.com',
    'qwen.ai'
  ];

  constructor(private secrets: SecretStore) {}

  // ============================================================================
  // Account Authentication
  // ============================================================================

  async getAccountStatus(): Promise<{ authenticated: boolean; account?: QwenAccountConfig }> {
    const token = await this.secrets.get('qwen/account/token');
    
    if (!token) {
      return { authenticated: false };
    }

    const accountId = await this.secrets.get('qwen/account/id');
    const email = await this.secrets.get('qwen/account/email');
    const displayName = await this.secrets.get('qwen/account/displayName');

    return {
      authenticated: true,
      account: {
        accountId: accountId || 'unknown',
        email: email || undefined,
        displayName: displayName || undefined,
        token,
      },
    };
  }

  async login(): Promise<boolean> {
    return new Promise((resolve) => {
      this.authWindow = new BrowserWindow({
        width: 900,
        height: 700,
        title: 'Sign in to Qwen',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          partition: this.partition,
        },
      });

      // Restrict navigation to Qwen domains
      this.authWindow.webContents.setWindowOpenHandler(({ url }) =>
        this.isAllowedDomain(url) ? { action: 'allow' } : { action: 'deny' }
      );

      this.authWindow.webContents.on('will-navigate', (e, url) => {
        if (!this.isAllowedDomain(url)) {
          e.preventDefault();
        }
      });

      // Detect successful login
      this.authWindow.webContents.on('did-navigate', async (_e, url) => {
        if (url.includes('/dashboard') || url.includes('/console')) {
          const success = await this.captureSession();
          this.authWindow?.close();
          resolve(success);
        }
      });

      this.authWindow.on('closed', () => {
        this.authWindow = null;
        resolve(false);
      });

      // Load Qwen login page
      this.authWindow.loadURL('https://account.aliyun.com/login/login.htm');
    });
  }

  async logout(): Promise<void> {
    await this.secrets.delete('qwen/account/token');
    await this.secrets.delete('qwen/account/id');
    await this.secrets.delete('qwen/account/email');
    await this.secrets.delete('qwen/account/displayName');
    
    const ses = session.fromPartition(this.partition);
    await ses.clearStorageData();
  }

  private isAllowedDomain(url: string): boolean {
    try {
      const hostname = new URL(url).hostname;
      return this.allowedDomains.some((domain) => hostname.endsWith(domain));
    } catch {
      return false;
    }
  }

  private async captureSession(): Promise<boolean> {
    try {
      const ses = session.fromPartition(this.partition);
      const cookies = await ses.cookies.get({
        domain: '.aliyuncs.com',
        name: 'access_token',
      });

      if (cookies.length === 0) {
        return false;
      }

      await this.secrets.set('qwen/account/token', cookies[0].value);

      // Try to extract account info from other cookies
      const idCookie = await ses.cookies.get({
        domain: '.aliyuncs.com',
        name: 'user_id',
      });
      if (idCookie.length > 0) {
        await this.secrets.set('qwen/account/id', idCookie[0].value);
      }

      return true;
    } catch (error) {
      console.error('Failed to capture Qwen session:', error);
      return false;
    }
  }

  // ============================================================================
  // Local Qwen Studio Integration
  // ============================================================================

  async getLocalConfig(): Promise<QwenLocalConfig | null> {
    const configJson = await this.secrets.get('qwen/local/config');
    if (!configJson) return null;

    try {
      return JSON.parse(configJson);
    } catch {
      return null;
    }
  }

  async setLocalConfig(config: QwenLocalConfig): Promise<void> {
    await this.secrets.set('qwen/local/config', JSON.stringify(config));
  }

  async getStudioConfig(): Promise<QwenStudioConfig | null> {
    const configJson = await this.secrets.get('qwen/studio/config');
    if (!configJson) return null;

    try {
      return JSON.parse(configJson);
    } catch {
      return null;
    }
  }

  async setStudioConfig(config: QwenStudioConfig): Promise<void> {
    await this.secrets.set('qwen/studio/config', JSON.stringify(config));
  }

  async detectQwenStudio(): Promise<QwenStudioConfig | null> {
    // This would check if Qwen Studio Desktop is installed
    // For now, return a mock config
    const commonPaths = [
      '/Applications/Qwen Studio.app',
      'C:\\Program Files\\Qwen Studio\\QwenStudio.exe',
      '/usr/bin/qwen-studio',
    ];

    // In a real implementation, we'd check if these paths exist
    // For now, return null (not detected)
    return null;
  }
}
