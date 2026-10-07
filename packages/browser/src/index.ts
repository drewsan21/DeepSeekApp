import {
  BrowserWindow,
  BrowserView,
  Menu,
  MenuItemConstructorOptions
} from 'electron';
import { EventEmitter } from 'events';
import type {
  BrowserBounds,
  BrowserContextAction,
  BrowserContextActionPayload,
  BrowserTab,
  PageContext
} from '@deepseek/shared';

export class BrowserManager extends EventEmitter {
  private views = new Map<string, BrowserView>();
  private tabs = new Map<string, BrowserTab>();
  private activeTabId: string | null = null;
  private lastBounds: BrowserBounds = { x: 0, y: 0, width: 0, height: 0 };
  private partition = 'persist:deepseek-browser';

  constructor(private mainWindow: BrowserWindow) {
    super();
  }

  createTab(url = 'https://duckduckgo.com') {
    const id = `tab-${Date.now()}`;
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        partition: this.partition
      }
    });

    this.views.set(id, view);
    this.tabs.set(id, { id, url, title: url, loading: true });

    view.webContents.session.setPermissionRequestHandler(
      (_wc, permission, cb) => {
        cb(['clipboard-read', 'clipboard-sanitized-write'].includes(permission));
      }
    );

    view.webContents.setWindowOpenHandler(({ url }) => {
      this.createTab(url);
      return { action: 'deny' };
    });

    const update = () => this.emitTabUpdated(id);

    view.webContents.on('page-title-updated', update);
    view.webContents.on('did-navigate', update);
    view.webContents.on('did-navigate-in-page', update);
    view.webContents.on('did-start-loading', update);
    view.webContents.on('did-stop-loading', update);

    view.webContents.on('context-menu', (_e, params) => {
      const hasSelection = Boolean(params.selectionText?.trim());

      const items: MenuItemConstructorOptions[] = [
        {
          label: 'Ask DeepSeek about selection',
          enabled: hasSelection,
          click: () => this.emitContextAction(id, 'ask', params)
        },
        {
          label: 'Summarize selection',
          enabled: hasSelection,
          click: () => this.emitContextAction(id, 'summarize', params)
        },
        {
          label: 'Explain selection',
          enabled: hasSelection,
          click: () => this.emitContextAction(id, 'explain', params)
        },
        {
          label: 'Rewrite selection',
          enabled: hasSelection,
          click: () => this.emitContextAction(id, 'rewrite', params)
        },
        {
          label: 'Translate selection',
          enabled: hasSelection,
          click: () => this.emitContextAction(id, 'translate', params)
        }
      ];

      Menu.buildFromTemplate(items).popup();
    });

    this.mainWindow.addBrowserView(view);
    view.setBounds(this.lastBounds);
    view.webContents.loadURL(url);

    this.activeTabId = id;
    this.emitTabUpdated(id);

    return id;
  }

  listTabs(): BrowserTab[] {
    return [...this.tabs.values()];
  }

  getActiveTab() {
    return this.activeTabId;
  }

  activateTab(id: string) {
    const current = this.activeTabId ? this.views.get(this.activeTabId) : null;
    if (current) this.mainWindow.removeBrowserView(current);

    const next = this.views.get(id);
    if (!next) return;

    this.mainWindow.addBrowserView(next);
    next.setBounds(this.lastBounds);
    this.activeTabId = id;
    this.emitTabUpdated(id);
  }

  closeTab(id: string) {
    const view = this.views.get(id);
    if (!view) return;

    this.mainWindow.removeBrowserView(view);
    view.webContents.close();

    this.views.delete(id);
    this.tabs.delete(id);

    this.emit('tab-closed', { id });

    if (this.activeTabId === id) {
      const next = [...this.views.keys()][0] ?? null;
      this.activeTabId = next;
      if (next) this.activateTab(next);
    }
  }

  setBounds(bounds: BrowserBounds) {
    this.lastBounds = bounds;

    const view = this.activeTabId ? this.views.get(this.activeTabId) : null;
    view?.setBounds(bounds);
  }

  async getPageContext(tabId?: string): Promise<PageContext | null> {
    const id = tabId ?? this.activeTabId;
    if (!id) return null;

    const view = this.views.get(id);
    if (!view) return null;

    try {
      return await view.webContents.executeJavaScript(`
        (() => {
          return {
            url: location.href,
            title: document.title,
            selectedText: window.getSelection()?.toString() || '',
            readableText: (document.body?.innerText || '').slice(0, 8000)
          };
        })()
      `);
    } catch {
      return null;
    }
  }

  private emitTabUpdated(id: string) {
    const view = this.views.get(id);
    const tab = this.tabs.get(id);
    if (!view || !tab) return;

    tab.url = view.webContents.getURL();
    tab.title = view.webContents.getTitle() || tab.url;
    tab.loading = view.webContents.isLoading();

    this.emit('tab-updated', { ...tab });
  }

  private emitContextAction(
    tabId: string,
    action: BrowserContextAction,
    params: any
  ) {
    const tab = this.tabs.get(tabId);

    const payload: BrowserContextActionPayload = {
      action,
      tabId,
      url: params.pageURL || tab?.url || '',
      title: tab?.title || '',
      selectionText: params.selectionText || ''
    };

    this.emit('context-action', payload);
  }
}
