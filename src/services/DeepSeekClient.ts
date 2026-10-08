/**
 * Real DeepSeek API Client
 * Makes actual HTTP requests to DeepSeek API
 */

import axios, { AxiosInstance } from 'axios';

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: Partial<ChatMessage>;
    finish_reason: string | null;
  }[];
}

export class DeepSeekClient {
  private client: AxiosInstance;
  private config: DeepSeekConfig;

  constructor(config: DeepSeekConfig) {
    this.config = {
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      ...config
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Send a chat completion request
   */
  async chat(messages: ChatMessage[], options: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}): Promise<ChatCompletionResponse> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        stream: false
      });

      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Stream a chat completion
   */
  async *chatStream(messages: ChatMessage[], options: {
    temperature?: number;
    max_tokens?: number;
  } = {}): AsyncGenerator<StreamChunk> {
    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        stream: true
      }, {
        responseType: 'stream'
      });

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data) as StreamChunk;
              yield parsed;
            } catch (e) {
              // Skip malformed chunks
            }
          }
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<{ id: string; object: string; created: number }[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(`DeepSeek API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.chat([{ role: 'user', content: 'Hello' }], { max_tokens: 5 });
      return true;
    } catch {
      return false;
    }
  }
}
