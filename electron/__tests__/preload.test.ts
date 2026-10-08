/**
 * Tests for Electron Preload Script API
 * 
 * These tests verify that the preload script exposes the correct API surface
 */

// Mock ipcRenderer
const mockIpcRenderer = {
  invoke: jest.fn(),
  send: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
};

// Mock contextBridge
const mockContextBridge = {
  exposeInMainWorld: jest.fn(),
};

// Mock electron module
jest.mock('electron', () => ({
  contextBridge: mockContextBridge,
  ipcRenderer: mockIpcRenderer,
}));

describe('Preload Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Load the preload script
    jest.isolateModules(() => {
      require('../preload.js');
    });
  });

  test('exposes deepseek API to window', () => {
    expect(mockContextBridge.exposeInMainWorld).toHaveBeenCalledWith(
      'deepseek',
      expect.any(Object)
    );
  });

  test('exposes auth methods', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    expect(api.auth).toBeDefined();
    expect(typeof api.auth.login).toBe('function');
    expect(typeof api.auth.logout).toBe('function');
    expect(typeof api.auth.status).toBe('function');
  });

  test('exposes providers methods', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    expect(api.providers).toBeDefined();
    expect(typeof api.providers.list).toBe('function');
    expect(typeof api.providers.select).toBe('function');
    expect(typeof api.providers.getConfig).toBe('function');
    expect(typeof api.providers.configure).toBe('function');
  });

  test('exposes harness methods', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    expect(api.harness).toBeDefined();
    expect(typeof api.harness.start).toBe('function');
    expect(typeof api.harness.stop).toBe('function');
    expect(typeof api.harness.onStream).toBe('function');
  });

  test('exposes browser methods', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    expect(api.browser).toBeDefined();
    expect(typeof api.browser.open).toBe('function');
    expect(typeof api.browser.newTab).toBe('function');
    expect(typeof api.browser.listTabs).toBe('function');
    expect(typeof api.browser.getActiveTab).toBe('function');
    expect(typeof api.browser.activateTab).toBe('function');
    expect(typeof api.browser.closeTab).toBe('function');
    expect(typeof api.browser.setBounds).toBe('function');
    expect(typeof api.browser.getPageContext).toBe('function');
    expect(typeof api.browser.onTabUpdated).toBe('function');
    expect(typeof api.browser.onTabClosed).toBe('function');
    expect(typeof api.browser.onContextAction).toBe('function');
  });

  test('exposes approvals methods', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    expect(api.approvals).toBeDefined();
    expect(typeof api.approvals.respond).toBe('function');
  });

  test('exposes permissions methods', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    expect(api.permissions).toBeDefined();
    expect(typeof api.permissions.request).toBe('function');
    expect(typeof api.permissions.listSites).toBe('function');
    expect(typeof api.permissions.getSite).toBe('function');
    expect(typeof api.permissions.setSite).toBe('function');
    expect(typeof api.permissions.resetSite).toBe('function');
  });

  test('auth.login invokes correct IPC channel', async () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    mockIpcRenderer.invoke.mockResolvedValue(true);
    await api.auth.login();
    
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('auth:login');
  });

  test('providers.list invokes correct IPC channel', async () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    mockIpcRenderer.invoke.mockResolvedValue([]);
    await api.providers.list();
    
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('providers:list');
  });

  test('browser.open invokes correct IPC channel', async () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    mockIpcRenderer.invoke.mockResolvedValue('tab-123');
    await api.browser.open('https://example.com');
    
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('browser:open', 'https://example.com');
  });

  test('harness.onStream sets up listener', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    const callback = jest.fn();
    const unsubscribe = api.harness.onStream(callback);
    
    expect(mockIpcRenderer.on).toHaveBeenCalledWith('harness:event', expect.any(Function));
    expect(typeof unsubscribe).toBe('function');
  });

  test('harness.onStream unsubscribe removes listener', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    const callback = jest.fn();
    const unsubscribe = api.harness.onStream(callback);
    unsubscribe();
    
    expect(mockIpcRenderer.removeListener).toHaveBeenCalledWith('harness:event', expect.any(Function));
  });

  test('browser.setBounds uses send instead of invoke', () => {
    const call = mockContextBridge.exposeInMainWorld.mock.calls[0];
    const api = call[1];
    
    const bounds = { x: 0, y: 0, width: 800, height: 600 };
    api.browser.setBounds(bounds);
    
    expect(mockIpcRenderer.send).toHaveBeenCalledWith('browser:set-bounds', bounds);
  });
});
