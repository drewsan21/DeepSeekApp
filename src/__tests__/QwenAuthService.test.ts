/**
 * Tests for Qwen Authentication Service
 */

import { QwenAuthService, getQwenAuthService, resetQwenAuthService } from '../services/QwenAuthService';
import type { QwenAuthConfig } from '../services/QwenAuthService';

// Mock fetch
global.fetch = jest.fn();

const mockConfig: QwenAuthConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  scope: ['openid', 'profile', 'email'],
};

describe('QwenAuthService', () => {
  let authService: QwenAuthService;

  beforeEach(() => {
    resetQwenAuthService();
    authService = getQwenAuthService(mockConfig);
    jest.clearAllMocks();
  });

  afterEach(() => {
    authService.destroy();
    resetQwenAuthService();
  });

  describe('Initialization', () => {
    it('should initialize with unauthenticated state', () => {
      const state = authService.getState();
      expect(state.authenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
    });

    it('should return singleton instance', () => {
      const instance1 = getQwenAuthService(mockConfig);
      const instance2 = getQwenAuthService();
      expect(instance1).toBe(instance2);
    });

    it('should throw error if getting instance without config', () => {
      resetQwenAuthService();
      expect(() => getQwenAuthService()).toThrow('QwenAuthService not initialized');
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate valid authorization URL', () => {
      const url = authService.getAuthorizationUrl();
      
      expect(url).toContain('https://account.qwen.ai/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid+profile+email');
      expect(url).toContain('state=');
    });
  });

  describe('exchangeCode', () => {
    it('should exchange code for tokens successfully', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        });

      const tokens = await authService.exchangeCode('test-code');

      expect(tokens.accessToken).toBe('test-access-token');
      expect(tokens.refreshToken).toBe('test-refresh-token');
      expect(tokens.tokenType).toBe('Bearer');
      expect(authService.isAuthenticated()).toBe(true);
      
      const state = authService.getState();
      expect(state.user?.email).toBe('test@example.com');
      expect(state.user?.name).toBe('Test User');
    });

    it('should handle token exchange failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(authService.exchangeCode('invalid-code')).rejects.toThrow(
        'Token exchange failed'
      );
    });

    it('should emit authenticated event on success', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        });

      const authHandler = jest.fn();
      authService.on('authenticated', authHandler);

      await authService.exchangeCode('test-code');

      expect(authHandler).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      // First, set up initial tokens
      const mockTokens = {
        access_token: 'old-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        });

      await authService.exchangeCode('test-code');

      // Now test refresh
      const newTokens = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newTokens),
      });

      const refreshedTokens = await authService.refreshAccessToken();

      expect(refreshedTokens.accessToken).toBe('new-access-token');
      expect(refreshedTokens.refreshToken).toBe('new-refresh-token');
    });

    it('should throw error if no refresh token', async () => {
      await expect(authService.refreshAccessToken()).rejects.toThrow(
        'No refresh token available'
      );
    });

    it('should logout on refresh failure', async () => {
      // Set up initial tokens
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        });

      await authService.exchangeCode('test-code');

      // Mock refresh failure
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(authService.refreshAccessToken()).rejects.toThrow();
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear authentication state', async () => {
      // Set up authenticated state
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        });

      await authService.exchangeCode('test-code');
      expect(authService.isAuthenticated()).toBe(true);

      // Mock token revocation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await authService.logout();

      expect(authService.isAuthenticated()).toBe(false);
      const state = authService.getState();
      expect(state.user).toBeNull();
      expect(state.tokens).toBeNull();
    });

    it('should emit logout event', async () => {
      const logoutHandler = jest.fn();
      authService.on('logout', logoutHandler);

      await authService.logout();

      expect(logoutHandler).toHaveBeenCalled();
    });
  });

  describe('getAccessToken', () => {
    it('should return null when not authenticated', () => {
      expect(authService.getAccessToken()).toBeNull();
    });

    it('should return access token when authenticated', async () => {
      const mockTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      const mockUserInfo = {
        sub: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTokens),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        });

      await authService.exchangeCode('test-code');

      expect(authService.getAccessToken()).toBe('test-access-token');
    });
  });

  describe('validateState', () => {
    it('should validate non-empty state', () => {
      expect(authService.validateState('valid-state')).toBe(true);
    });

    it('should reject empty state', () => {
      expect(authService.validateState('')).toBe(false);
    });
  });
});
