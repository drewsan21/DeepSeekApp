import { BrowserWindow, ipcMain } from 'electron';
import type { AuthManager } from '@deepseek/auth';
import type { DeepSeekHarnessAdapter } from '@deepseek/harness';
import type { BrowserManager } from '@deepseek/browser';
import type { PermissionManager } from './services/PermissionManager';
import type { ProviderConfigManager } from './services/ProviderConfigManager';

export interface IpcDeps {
  auth: AuthManager;
  harness: DeepSeekHarnessAdapter;
  browser: BrowserManager;
  permissions: PermissionManager;
  providers: ProviderConfigManager;
}

export function registerIpc(mainWindow: BrowserWindow, deps: IpcDeps) {
  const send = (channel: string, payload: unknown) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, payload);
    }
  };

  deps.browser.on('tab-updated', tab => send('browser:tab-updated', tab));
  deps.browser.on('tab-closed', p => send('browser:tab-closed', p));
  deps.browser.on('context-action', p => send('browser:context-action', p));

  ipcMain.handle('auth:login', () => deps.auth.login());
  ipcMain.handle('auth:logout', () => deps.auth.logout());
  ipcMain.handle('auth:status', () => deps.auth.getStatus());

  ipcMain.handle('providers:list', async () => {
    const auth = await deps.auth.getStatus();
    return deps.providers.list(auth.authenticated);
  });

  ipcMain.handle('providers:getConfig', async () => {
    const auth = await deps.auth.getStatus();
    return deps.providers.list(auth.authenticated);
  });

  ipcMain.handle('providers:configure', async (_e, req) => {
    await deps.providers.configure(req);
    return true;
  });

  ipcMain.handle('providers:select', async (_e, providerId) => {
    console.log('selected provider', providerId);
    return true;
  });

  ipcMain.handle('harness:start', async (_e, request) => {
    void (async () => {
      try {
        const stream = await deps.harness.stream(request);
        for await (const event of stream) {
          send('harness:event', event);
        }
      } catch (err) {
        send('harness:event', {
          type: 'error',
          message: err instanceof Error ? err.message : String(err)
        });
      }
    })();

    return { started: true };
  });

  ipcMain.handle('harness:stop', () => deps.harness.stop());

  ipcMain.handle('approval:respond', async (_e, payload) => {
    await deps.harness.respondApproval?.(payload.id, payload);
    return true;
  });

  ipcMain.handle('browser:open', (_e, url) => deps.browser.createTab(url));
  ipcMain.handle('browser:new', (_e, url) => deps.browser.createTab(url));
  ipcMain.handle('browser:list', () => deps.browser.listTabs());
  ipcMain.handle('browser:active-tab', () => deps.browser.getActiveTab());

  ipcMain.handle('browser:activate', (_e, id) => {
    deps.browser.activateTab(id);
    return true;
  });

  ipcMain.handle('browser:close', (_e, id) => {
    deps.browser.closeTab(id);
    return true;
  });

  ipcMain.on('browser:set-bounds', (_e, bounds) => {
    deps.browser.setBounds(bounds);
  });

  ipcMain.handle('browser:page-context', (_e, id) =>
    deps.browser.getPageContext(id)
  );

  ipcMain.handle('permissions:listSites', () => deps.permissions.list());
  ipcMain.handle('permissions:getSite', (_e, origin) =>
    deps.permissions.get(origin)
  );

  ipcMain.handle('permissions:setSite', async (_e, payload) => {
    await deps.permissions.set(payload.origin, payload.permissions);
    return true;
  });

  ipcMain.handle('permissions:resetSite', async (_e, origin) => {
    await deps.permissions.reset(origin);
    return true;
  });

  ipcMain.handle('permissions:request', async () => false);
}
