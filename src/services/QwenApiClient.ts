/**
 * Qwen API Client
 * 
 * Handles communication with Qwen API endpoints
 */

import { getQwenAuthService } from './QwenAuthService';

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface QwenChatRequest {
  model: string;
  messages: QwenMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface QwenChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: QwenMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface QwenStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: Partial<QwenMessage>;
    finish_reason: string | null;
  }[];
}

export interface QwenModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
}

export class QwenApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://api.qwen.ai/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const authService = getQwenAuthService();
    const token = authService.getAccessToken();
    
    if (!token) {
      throw new Error('Not authenticated. Please login first.');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * List available models
   */
  async listModels(): Promise<QwenModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error listing models:', error);
      throw error;
    }
  }

  /**
   * Send chat completion request
   */
  async chat(request: QwenChatRequest): Promise<QwenChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...request,
          stream: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Chat request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in chat request:', error);
      throw error;
    }
  }

  /**
   * Send streaming chat completion request
   */
  async *chatStream(request: QwenChatRequest): AsyncGenerator<QwenStreamChunk> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Stream request failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              return;
            }

            try {
              const chunk: QwenStreamChunk = JSON.parse(data);
              yield chunk;
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in stream request:', error);
      throw error;
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsage(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/usage`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get usage: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting usage:', error);
      throw error;
    }
  }
}

// Export singleton instance
let apiClientInstance: QwenApiClient | null = null;

export function getQwenApiClient(baseUrl?: string): QwenApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new QwenApiClient(baseUrl);
  }
  return apiClientInstance;
}

export function resetQwenApiClient(): void {
  apiClientInstance = null;
}
