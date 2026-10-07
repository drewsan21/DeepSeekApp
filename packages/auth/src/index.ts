import { BrowserWindow, session } from 'electron';
import type { AuthStatus, Account } from '@deepseek/shared';

export interface SecretStore {
  set(key: string, value: string): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
}

export class AuthManager {
  private win: BrowserWindow | null = null;
  private partition = 'persist:deepseek-auth';
  private allowed = ['chat.deepseek.com', 'api.deepseek.com'];

  constructor(private secrets: SecretStore) {}

  async getStatus(): Promise<AuthStatus> {
    const token = await this.secrets.get('deepseek/account/token');
    return token
      ? {
          authenticated: true,
          account: {
            provider: 'deepseek-account',
            accountId: 'local',
            email: 'user@example.com'
          }
        }
      : { authenticated: false };
  }

  async login(): Promise<boolean> {
    return new Promise(resolve => {
      this.win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true,
          partition: this.partition
        }
      });

      this.win.webContents.setWindowOpenHandler(({ url }) =>
        this.isAllowed(url) ? { action: 'allow' } : { action: 'deny' }
      );

      this.win.webContents.on('will-navigate', (e, url) => {
        if (!this.isAllowed(url)) e.preventDefault();
      });

      this.win.webContents.on('did-navigate', async (_e, url) => {
        if (url.includes('/dashboard') || url.includes('/auth/callback')) {
          const ok = await this.capture();
          this.win?.close();
          resolve(ok);
        }
      });

      this.win.on('closed', () => {
        this.win = null;
        resolve(false);
      });

      this.win.loadURL('https://chat.deepseek.com/sign_in');
    });
  }

  async logout() {
    await this.secrets.delete('deepseek/account/token');
    await session.fromPartition(this.partition).clearStorageData();
  }

  private isAllowed(url: string) {
    try {
      const host = new URL(url).hostname;
      return this.allowed.some(d => host.endsWith(d));
    } catch {
      return false;
    }
  }

  private async capture() {
    const cookies = await session
      .fromPartition(this.partition)
      .cookies.get({ domain: '.deepseek.com', name: 'user_session_token' });

    if (!cookies.length) return false;

    await this.secrets.set('deepseek/account/token', cookies[0].value);
    return true;
  }
}
