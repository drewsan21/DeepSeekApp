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
   * Perform a request and parse the JSON response, centralising the
   * error-handling logic that was previously duplicated in every method.
   */
  private async request<T>(path: string, init: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, init);

      if (!response.ok) {
        // Try to surface the API's own error message when present.
        let errorMessage: string | null = null;
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.error?.message ?? null;
        } catch {
          // Non-JSON error body — fall back to the status text below.
        }
        throw new Error(errorMessage || `Request to ${path} failed: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`Error during ${init.method ?? 'GET'} ${path}:`, error);
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<QwenModel[]> {
    const data = await this.request<{ data?: QwenModel[] }>('/models', {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return data.data || [];
  }

  /**
   * Send chat completion request
   */
  async chat(request: QwenChatRequest): Promise<QwenChatResponse> {
    return this.request<QwenChatResponse>('/chat/completions', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        ...request,
        stream: false,
      }),
    });
  }

  /**
   * Send streaming chat completion request
   */
  async *chatStream(request: QwenChatRequest): AsyncGenerator<QwenStreamChunk> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
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
    } catch (error) {
      console.error('Error in stream request:', error);
      throw error;
    }

    // Release the underlying connection as soon as the generator finishes,
    // is closed early, or throws — otherwise the reader keeps the HTTP
    // stream alive and leaks resources.
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    try {
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
    } finally {
      reader.cancel().catch(() => {
        // Stream may already be exhausted; cancelling a closed reader is a no-op.
      });
    }
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<any> {
    return this.request('/user', {
      method: 'GET',
      headers: this.getHeaders(),
    });
  }

  /**
   * Get usage statistics
   */
  async getUsage(): Promise<any> {
    return this.request('/usage', {
      method: 'GET',
      headers: this.getHeaders(),
    });
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
