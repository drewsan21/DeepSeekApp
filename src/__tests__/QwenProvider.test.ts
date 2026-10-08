/**
 * Tests for Qwen Provider
 */

import { QwenProvider, getQwenProvider, resetQwenProvider } from '../services/QwenProvider';
import { getQwenAuthService, resetQwenAuthService } from '../services/QwenAuthService';
import { resetQwenApiClient } from '../services/QwenApiClient';
import type { QwenAuthConfig } from '../services/QwenAuthService';

// Mock fetch
global.fetch = jest.fn();

const mockConfig: QwenAuthConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  scope: ['openid', 'profile', 'email'],
};

describe('QwenProvider', () => {
  let provider: QwenProvider;
  let authService: ReturnType<typeof getQwenAuthService>;

  beforeEach(async () => {
    resetQwenProvider();
    resetQwenAuthService();
    resetQwenApiClient();
    
    authService = getQwenAuthService(mockConfig);

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
    jest.clearAllMocks();

    provider = getQwenProvider({
      model: 'qwen-max',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 0.9,
    });
  });

  afterEach(() => {
    authService.destroy();
    resetQwenAuthService();
    resetQwenProvider();
    resetQwenApiClient();
  });

  describe('Initialization', () => {
    it('should initialize with config', () => {
      const config = provider.getConfig();
      expect(config.model).toBe('qwen-max');
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(2000);
      expect(config.topP).toBe(0.9);
    });

    it('should return singleton instance', () => {
      const instance1 = getQwenProvider();
      const instance2 = getQwenProvider();
      expect(instance1).toBe(instance2);
    });

    it('should throw error if getting instance without config', () => {
      resetQwenProvider();
      expect(() => getQwenProvider()).toThrow('QwenProvider not initialized');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when authenticated', async () => {
      const isAuthenticated = await provider.isAuthenticated();
      expect(isAuthenticated).toBe(true);
    });

    it('should return false when not authenticated', async () => {
      await authService.logout();
      const isAuthenticated = await provider.isAuthenticated();
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('getName', () => {
    it('should return provider name', () => {
      expect(provider.getName()).toBe('Qwen');
    });
  });

  describe('getId', () => {
    it('should return provider ID', () => {
      expect(provider.getId()).toBe('qwen');
    });
  });

  describe('getModels', () => {
    it('should fetch available models', async () => {
      const mockModels = {
        data: [
          { id: 'qwen-max', object: 'model', created: 1234567890, owned_by: 'qwen' },
          { id: 'qwen-plus', object: 'model', created: 1234567890, owned_by: 'qwen' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockModels),
      });

      const models = await provider.getModels();

      expect(models).toContain('qwen-max');
      expect(models).toContain('qwen-plus');
    });

    it('should return default models on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const models = await provider.getModels();

      expect(models).toContain('qwen-max');
      expect(models).toContain('qwen-plus');
      expect(models).toContain('qwen-turbo');
      expect(models).toContain('qwen-coder');
    });
  });

  describe('chat', () => {
    it('should send chat request and return response', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1234567890,
        model: 'qwen-max',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await provider.chat([
        { role: 'user', content: 'Hello' },
      ]);

      expect(response).toBe('Hello! How can I help you?');
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1234567890,
        model: 'qwen-max',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 0,
          total_tokens: 10,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const response = await provider.chat([
        { role: 'user', content: 'Hello' },
      ]);

      expect(response).toBe('');
    });
  });

  describe('chatStream', () => {
    it('should stream response chunks', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('data: {"id":"1","choices":[{"delta":{"content":"Hello"}}]}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: {"id":"1","choices":[{"delta":{"content":" world"}}]}\n\n'));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      });

      const chunks = [];
      for await (const chunk of provider.chatStream([
        { role: 'user', content: 'Hello' },
      ])) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toBe('Hello');
      expect(chunks[1]).toBe(' world');
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      provider.updateConfig({
        model: 'qwen-plus',
        temperature: 0.5,
      });

      const config = provider.getConfig();
      expect(config.model).toBe('qwen-plus');
      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(2000); // Unchanged
      expect(config.topP).toBe(0.9); // Unchanged
    });

    it('should preserve existing config when updating', () => {
      provider.updateConfig({
        model: 'qwen-turbo',
      });

      const config = provider.getConfig();
      expect(config.model).toBe('qwen-turbo');
      expect(config.temperature).toBe(0.7); // Preserved
      expect(config.maxTokens).toBe(2000); // Preserved
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = provider.getConfig();
      
      expect(config).toEqual({
        model: 'qwen-max',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
      });
    });

    it('should return a copy of configuration', () => {
      const config1 = provider.getConfig();
      const config2 = provider.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Different object references
    });
  });
});
