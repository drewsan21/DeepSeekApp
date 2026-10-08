/**
 * Tests for Qwen API Client
 */

import { QwenApiClient, getQwenApiClient, resetQwenApiClient } from '../services/QwenApiClient';
import { getQwenAuthService, resetQwenAuthService } from '../services/QwenAuthService';
import type { QwenAuthConfig } from '../services/QwenAuthService';

// Mock fetch
global.fetch = jest.fn();

const mockConfig: QwenAuthConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  scope: ['openid', 'profile', 'email'],
};

describe('QwenApiClient', () => {
  let apiClient: QwenApiClient;
  let authService: ReturnType<typeof getQwenAuthService>;

  beforeEach(async () => {
    resetQwenApiClient();
    resetQwenAuthService();
    
    apiClient = getQwenApiClient();
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
  });

  afterEach(() => {
    authService.destroy();
    resetQwenAuthService();
    resetQwenApiClient();
  });

  describe('Initialization', () => {
    it('should return singleton instance', () => {
      const instance1 = getQwenApiClient();
      const instance2 = getQwenApiClient();
      expect(instance1).toBe(instance2);
    });

    it('should use default base URL', () => {
      const client = new QwenApiClient();
      expect(client).toBeDefined();
    });

    it('should accept custom base URL', () => {
      const client = new QwenApiClient('https://custom.api.com/v1');
      expect(client).toBeDefined();
    });
  });

  describe('listModels', () => {
    it('should fetch models successfully', async () => {
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

      const models = await apiClient.listModels();

      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('qwen-max');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.qwen.ai/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-access-token',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(apiClient.listModels()).rejects.toThrow('Failed to list models');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.listModels()).rejects.toThrow('Network error');
    });
  });

  describe('chat', () => {
    it('should send chat request successfully', async () => {
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

      const response = await apiClient.chat({
        model: 'qwen-max',
        messages: [
          { role: 'user', content: 'Hello' },
        ],
      });

      expect(response.choices[0].message.content).toBe('Hello! How can I help you?');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.qwen.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-access-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle chat API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          error: {
            message: 'Invalid request',
          },
        }),
      });

      await expect(
        apiClient.chat({
          model: 'qwen-max',
          messages: [{ role: 'user', content: 'Hello' }],
        })
      ).rejects.toThrow('Invalid request');
    });

    it('should throw error when not authenticated', async () => {
      await authService.logout();

      await expect(
        apiClient.chat({
          model: 'qwen-max',
          messages: [{ role: 'user', content: 'Hello' }],
        })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('chatStream', () => {
    it('should handle streaming response', async () => {
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
      for await (const chunk of apiClient.chatStream({
        model: 'qwen-max',
        messages: [{ role: 'user', content: 'Hello' }],
      })) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(2);
      expect(chunks[0].choices[0].delta.content).toBe('Hello');
      expect(chunks[1].choices[0].delta.content).toBe(' world');
    });

    it('should handle stream errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          error: {
            message: 'Stream failed',
          },
        }),
      });

      await expect(
        apiClient.chatStream({
          model: 'qwen-max',
          messages: [{ role: 'user', content: 'Hello' }],
        }).next()
      ).rejects.toThrow('Stream failed');
    });
  });

  describe('getUserInfo', () => {
    it('should fetch user info successfully', async () => {
      const mockUserInfo = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserInfo),
      });

      const userInfo = await apiClient.getUserInfo();

      expect(userInfo.email).toBe('test@example.com');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.qwen.ai/v1/user',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });

  describe('getUsage', () => {
    it('should fetch usage statistics', async () => {
      const mockUsage = {
        total_tokens: 10000,
        total_requests: 100,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsage),
      });

      const usage = await apiClient.getUsage();

      expect(usage.total_tokens).toBe(10000);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.qwen.ai/v1/usage',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });
});
