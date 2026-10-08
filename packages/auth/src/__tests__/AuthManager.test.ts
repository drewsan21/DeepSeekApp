// ============================================================================
// Auth Manager Tests
// ============================================================================

import { AuthManager } from '../src/index';

// Mock Electron modules
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
    webContents: {
      on: jest.fn(),
      setWindowOpenHandler: jest.fn(),
    },
  })),
  session: {
    fromPartition: jest.fn().mockReturnValue({
      cookies: {
        get: jest.fn(),
      },
      clearStorageData: jest.fn(),
    }),
  },
}));

describe('AuthManager', () => {
  let authManager: AuthManager;
  let mockSecretStore: any;

  beforeEach(() => {
    mockSecretStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };
    authManager = new AuthManager(mockSecretStore);
  });

  describe('getStatus', () => {
    it('should return authenticated status when token exists', async () => {
      mockSecretStore.get.mockResolvedValue('test-token');

      const status = await authManager.getStatus();

      expect(status.authenticated).toBe(true);
      expect(status.account).toBeDefined();
      expect(status.account?.provider).toBe('deepseek-account');
    });

    it('should return unauthenticated status when no token', async () => {
      mockSecretStore.get.mockResolvedValue(null);

      const status = await authManager.getStatus();

      expect(status.authenticated).toBe(false);
      expect(status.account).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should delete token and clear session', async () => {
      await authManager.logout();

      expect(mockSecretStore.delete).toHaveBeenCalledWith('deepseek/account/token');
    });
  });

  describe('getLocalConfig', () => {
    it('should return null when no config exists', async () => {
      mockSecretStore.get.mockResolvedValue(null);

      const config = await authManager.getLocalConfig();

      expect(config).toBeNull();
    });

    it('should return parsed config when exists', async () => {
      const mockConfig = { modelPath: '/path/to/model', modelName: 'test' };
      mockSecretStore.get.mockResolvedValue(JSON.stringify(mockConfig));

      const config = await authManager.getLocalConfig();

      expect(config).toEqual(mockConfig);
    });
  });

  describe('setLocalConfig', () => {
    it('should save config to secret store', async () => {
      const config = { modelPath: '/path/to/model', modelName: 'test' };

      await authManager.setLocalConfig(config as any);

      expect(mockSecretStore.set).toHaveBeenCalledWith(
        'qwen/local/config',
        JSON.stringify(config)
      );
    });
  });
});
