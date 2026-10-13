/**
 * Real Browser Engine
 * Uses Electron's BrowserView for actual web browsing
 */

const { BrowserView, BrowserWindow } = require('electron');

class BrowserEngine {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.tabs = new Map();
    this.activeTabId = null;
  }

  /**
   * Create a new browser tab
   */
  createTab(url: string = 'https://duckduckgo.com'): string {
    const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true
      }
    });

    const tab: BrowserTab = {
      id,
      url,
      title: 'New Tab',
      isLoading: true,
      canGoBack: false,
      canGoForward: false,
      view
    };

    this.tabs.set(id, tab);
    this.mainWindow.addBrowserView(view);
    
    // Set up event listeners
    this.setupTabEvents(tab);
    
    // Load the URL
    view.webContents.loadURL(url);
    
    // Set as active tab
    this.setActiveTab(id);
    
    return id;
  }

  /**
   * Set up event listeners for a tab
   */
  private setupTabEvents(tab: BrowserTab) {
    const { view } = tab;

    // Page title updated
    view.webContents.on('page-title-updated', (event, title) => {
      tab.title = title;
      this.emitTabUpdate(tab.id);
    });

    // Page started loading
    view.webContents.on('did-start-loading', () => {
      tab.isLoading = true;
      this.emitTabUpdate(tab.id);
    });

    // Page finished loading
    view.webContents.on('did-stop-loading', () => {
      tab.isLoading = false;
      tab.url = view.webContents.getURL();
      this.emitTabUpdate(tab.id);
    });

    // Navigation completed
    view.webContents.on('did-navigate', (event, url) => {
      tab.url = url;
      tab.canGoBack = view.webContents.canGoBack();
      tab.canGoForward = view.webContents.canGoForward();
      this.emitTabUpdate(tab.id);
    });

    // In-page navigation
    view.webContents.on('did-navigate-in-page', (event, url) => {
      tab.url = url;
      tab.canGoBack = view.webContents.canGoBack();
      tab.canGoForward = view.webContents.canGoForward();
      this.emitTabUpdate(tab.id);
    });

    // Favicon updated
    view.webContents.on('page-favicon-updated', (event, favicons) => {
      if (favicons.length > 0) {
        tab.favicon = favicons[0];
        this.emitTabUpdate(tab.id);
      }
    });
  }

  /**
   * Emit tab update event
   */
  emitTabUpdate(tabId) {
    const tab = this.tabs.get(tabId);
    if (tab) {
      this.mainWindow.webContents.send('browser:tab-updated', {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        favicon: tab.favicon,
        isLoading: tab.isLoading,
        canGoBack: tab.canGoBack,
        canGoForward: tab.canGoForward
      });
    }
  }

  /**
   * Set active tab
   */
  setActiveTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // Hide current active tab
    if (this.activeTabId && this.activeTabId !== tabId) {
      const currentTab = this.tabs.get(this.activeTabId);
      if (currentTab) {
        this.mainWindow.removeBrowserView(currentTab.view);
      }
    }

    // Show new active tab
    this.mainWindow.addBrowserView(tab.view);
    this.activeTabId = tabId;

    // Focus the web contents
    tab.view.webContents.focus();

    this.mainWindow.webContents.send('browser:active-tab-changed', tabId);
  }

  /**
   * Close a tab
   */
  closeTab(tabId) {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    // Remove the browser view
    this.mainWindow.removeBrowserView(tab.view);
    
    // Destroy the web contents
    tab.view.webContents.close();

    // Remove from tabs map
    this.tabs.delete(tabId);

    // If this was the active tab, switch to another
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.keys());
      if (remainingTabs.length > 0) {
        this.setActiveTab(remainingTabs[0]);
      } else {
        this.activeTabId = null;
      }
    }

    this.mainWindow.webContents.send('browser:tab-closed', tabId);
  }

  /**
   * Navigate to URL
   */
  navigate(url) {
    const tab = this.getActiveTab();
    if (!tab) return;

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    tab.view.webContents.loadURL(url);
  }

  /**
   * Go back
   */
  goBack() {
    const tab = this.getActiveTab();
    if (tab && tab.view.webContents.canGoBack()) {
      tab.view.webContents.goBack();
    }
  }

  /**
   * Go forward
   */
  goForward() {
    const tab = this.getActiveTab();
    if (tab && tab.view.webContents.canGoForward()) {
      tab.view.webContents.goForward();
    }
  }

  /**
   * Reload page
   */
  reload() {
    const tab = this.getActiveTab();
    if (tab) {
      tab.view.webContents.reload();
    }
  }

  /**
   * Get active tab
   */
  getActiveTab() {
    if (!this.activeTabId) return null;
    return this.tabs.get(this.activeTabId) || null;
  }

  /**
   * Get all tabs
   */
  getAllTabs() {
    return Array.from(this.tabs.values());
  }

  /**
   * Extract page context from active tab
   */
  async extractPageContext() {
    const tab = this.getActiveTab();
    if (!tab) return null;

    try {
      const context = await tab.view.webContents.executeJavaScript(`
        (function() {
          // Get selected text
          const selection = window.getSelection();
          const selectedText = selection ? selection.toString() : '';

          // Get readable text (main content)
          const article = document.querySelector('article') || 
                         document.querySelector('main') || 
                         document.body;
          const readableText = article ? article.innerText.substring(0, 10000) : '';

          // Get links
          const links = Array.from(document.querySelectorAll('a[href]'))
            .slice(0, 50)
            .map(a => ({
              href: a.href,
              text: a.innerText.trim()
            }))
            .filter(link => link.text.length > 0);

          // Get images
          const images = Array.from(document.querySelectorAll('img[src]'))
            .slice(0, 20)
            .map(img => ({
              src: img.src,
              alt: img.alt || ''
            }));

          return {
            url: window.location.href,
            title: document.title,
            selectedText,
            readableText,
            links,
            images
          };
        })()
      `);

      return context;
    } catch (error) {
      console.error('Failed to extract page context:', error);
      return null;
    }
  }

  /**
   * Take screenshot of active tab
   */
  async takeScreenshot() {
    const tab = this.getActiveTab();
    if (!tab) return null;

    try {
      const image = await tab.view.webContents.capturePage();
      return image.toDataURL();
    } catch (error) {
      console.error('Failed to take screenshot:', error);
      return null;
    }
  }

  /**
   * Execute JavaScript in active tab
   */
  async executeJavaScript(code) {
    const tab = this.getActiveTab();
    if (!tab) return null;

    try {
      return await tab.view.webContents.executeJavaScript(code);
    } catch (error) {
      console.error('Failed to execute JavaScript:', error);
      return null;
    }
  }

  /**
   * Find text in page
   */
  findInPage(text) {
    const tab = this.getActiveTab();
    if (tab) {
      tab.view.webContents.findInPage(text);
    }
  }

  /**
   * Stop finding in page
   */
  stopFindInPage() {
    const tab = this.getActiveTab();
    if (tab) {
      tab.view.webContents.stopFindInPage('clearSelection');
    }
  }

  /**
   * Set zoom level
   */
  setZoomLevel(level) {
    const tab = this.getActiveTab();
    if (tab) {
      tab.view.webContents.setZoomLevel(level);
    }
  }

  /**
   * Get all tab info (for IPC)
   */
  getTabInfo() {
    return Array.from(this.tabs.values()).map(tab => ({
      id: tab.id,
      url: tab.url,
      title: tab.title,
      favicon: tab.favicon,
      isLoading: tab.isLoading,
      canGoBack: tab.canGoBack,
      canGoForward: tab.canGoForward,
      isActive: tab.id === this.activeTabId
    }));
  }

  /**
   * Set bounds for all browser views
   */
  setBounds(bounds) {
    this.tabs.forEach(tab => {
      tab.view.setBounds(bounds);
    });
  }

  /**
   * Destroy all tabs
   */
  destroy() {
    this.tabs.forEach(tab => {
      this.mainWindow.removeBrowserView(tab.view);
      tab.view.webContents.close();
    });
    this.tabs.clear();
    this.activeTabId = null;
  }
}

module.exports = { BrowserEngine };
