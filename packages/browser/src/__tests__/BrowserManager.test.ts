// ============================================================================
// Browser Manager Tests
// ============================================================================

import { BrowserManager } from '../src/index';

// Mock Electron modules
jest.mock('electron', () => ({
  BrowserView: jest.fn().mockImplementation(() => ({
    webContents: {
      on: jest.fn(),
      loadURL: jest.fn(),
      getURL: jest.fn(),
      getTitle: jest.fn(),
      isLoading: jest.fn(),
      close: jest.fn(),
      setWindowOpenHandler: jest.fn(),
      session: {
        setPermissionRequestHandler: jest.fn(),
      },
      executeJavaScript: jest.fn(),
    },
    setBounds: jest.fn(),
  })),
  Menu: {
    buildFromTemplate: jest.fn().mockReturnValue({
      popup: jest.fn(),
    }),
  },
}));

describe('BrowserManager', () => {
  let browserManager: BrowserManager;
  let mockMainWindow: any;

  beforeEach(() => {
    mockMainWindow = {
      addBrowserView: jest.fn(),
      removeBrowserView: jest.fn(),
    };
    browserManager = new BrowserManager(mockMainWindow);
  });

  describe('createTab', () => {
    it('should create a new tab with default URL', () => {
      const tabId = browserManager.createTab();

      expect(tabId).toBeDefined();
      expect(tabId).toMatch(/^tab-/);
      expect(mockMainWindow.addBrowserView).toHaveBeenCalled();
    });

    it('should create a new tab with custom URL', () => {
      const customUrl = 'https://example.com';
      const tabId = browserManager.createTab(customUrl);

      expect(tabId).toBeDefined();
      expect(mockMainWindow.addBrowserView).toHaveBeenCalled();
    });

    it('should emit tab-updated event', () => {
      const emitSpy = jest.spyOn(browserManager, 'emit');

      browserManager.createTab();

      expect(emitSpy).toHaveBeenCalledWith('tab-updated', expect.any(Object));
    });
  });

  describe('listTabs', () => {
    it('should return empty array initially', () => {
      const tabs = browserManager.listTabs();

      expect(tabs).toEqual([]);
    });

    it('should return all created tabs', () => {
      browserManager.createTab('https://example1.com');
      browserManager.createTab('https://example2.com');

      const tabs = browserManager.listTabs();

      expect(tabs.length).toBe(2);
    });
  });

  describe('getActiveTab', () => {
    it('should return null when no tabs exist', () => {
      const activeTab = browserManager.getActiveTab();

      expect(activeTab).toBeNull();
    });

    it('should return the last created tab ID', () => {
      const tabId1 = browserManager.createTab();
      const tabId2 = browserManager.createTab();

      const activeTab = browserManager.getActiveTab();

      expect(activeTab).toBe(tabId2);
    });
  });

  describe('activateTab', () => {
    it('should switch to specified tab', () => {
      const tabId1 = browserManager.createTab();
      const tabId2 = browserManager.createTab();

      browserManager.activateTab(tabId1);

      expect(mockMainWindow.removeBrowserView).toHaveBeenCalled();
      expect(mockMainWindow.addBrowserView).toHaveBeenCalled();
    });

    it('should not throw error for non-existent tab', () => {
      expect(() => {
        browserManager.activateTab('non-existent');
      }).not.toThrow();
    });
  });

  describe('closeTab', () => {
    it('should close specified tab', () => {
      const tabId = browserManager.createTab();

      browserManager.closeTab(tabId);

      const tabs = browserManager.listTabs();
      expect(tabs.length).toBe(0);
    });

    it('should emit tab-closed event', () => {
      const emitSpy = jest.spyOn(browserManager, 'emit');
      const tabId = browserManager.createTab();

      browserManager.closeTab(tabId);

      expect(emitSpy).toHaveBeenCalledWith('tab-closed', { id: tabId });
    });

    it('should activate next tab when closing active tab', () => {
      const tabId1 = browserManager.createTab();
      const tabId2 = browserManager.createTab();

      browserManager.closeTab(tabId2);

      const activeTab = browserManager.getActiveTab();
      expect(activeTab).toBe(tabId1);
    });
  });

  describe('setBounds', () => {
    it('should update bounds for active tab', () => {
      const tabId = browserManager.createTab();
      const bounds = { x: 0, y: 0, width: 800, height: 600 };

      browserManager.setBounds(bounds);

      // Bounds should be stored
      expect(browserManager['lastBounds']).toEqual(bounds);
    });
  });

  describe('getPageContext', () => {
    it('should return null when no active tab', async () => {
      const context = await browserManager.getPageContext();

      expect(context).toBeNull();
    });

    it('should return page context for active tab', async () => {
      const tabId = browserManager.createTab();
      const mockContext = {
        url: 'https://example.com',
        title: 'Example',
        selectedText: '',
        readableText: 'Page content',
      };

      // Mock executeJavaScript
      const mockView = browserManager['views'].get(tabId);
      (mockView.webContents.executeJavaScript as jest.Mock).mockResolvedValue(mockContext);

      const context = await browserManager.getPageContext();

      expect(context).toBeDefined();
      expect(context?.url).toBe(mockContext.url);
    });
  });
});
