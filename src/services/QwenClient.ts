/**
 * Real Qwen API Client
 * Makes actual HTTP requests to Qwen API
 */

import axios, { AxiosInstance } from 'axios';

export interface QwenConfig {
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content?: string;
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

export class QwenClient {
  private client: AxiosInstance;
  private config: QwenConfig;

  constructor(config: QwenConfig) {
    this.config = {
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      ...config,
      model: config.model || 'qwen-max'
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
      const response = await this.client.post('/services/aigc/text-generation/generation', {
        model: this.config.model,
        input: {
          messages
        },
        parameters: {
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 2000,
          result_format: 'message'
        }
      });

      return {
        id: response.data.request_id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: this.config.model,
        choices: [{
          index: 0,
          message: response.data.output.choices[0].message,
          finish_reason: response.data.output.choices[0].finish_reason
        }],
        usage: {
          prompt_tokens: response.data.usage.input_tokens,
          completion_tokens: response.data.usage.output_tokens,
          total_tokens: response.data.usage.total_tokens
        }
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Qwen API error: ${error.response?.data?.message || error.message}`);
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
      const response = await this.client.post('/services/aigc/text-generation/generation', {
        model: this.config.model,
        input: {
          messages
        },
        parameters: {
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 2000,
          result_format: 'message',
          incremental_output: true
        }
      }, {
        responseType: 'stream',
        headers: {
          'X-DashScope-SSE': 'enable'
        }
      });

      let buffer = '';
      
      for await (const chunk of response.data) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.output?.choices) {
                const choice = parsed.output.choices[0];
                yield {
                  id: parsed.request_id,
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: this.config.model,
                  choices: [{
                    index: 0,
                    delta: {
                      role: choice.message?.role,
                      content: choice.message?.content || ''
                    },
                    finish_reason: choice.finish_reason || null
                  }]
                };
              }
            } catch (e) {
              // Skip malformed chunks
            }
          }
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Qwen API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<{ id: string; object: string; created: number }[]> {
    // Qwen doesn't have a models endpoint, return hardcoded list
    return [
      { id: 'qwen-max', object: 'model', created: Date.now() },
      { id: 'qwen-plus', object: 'model', created: Date.now() },
      { id: 'qwen-turbo', object: 'model', created: Date.now() },
      { id: 'qwen-coder-plus', object: 'model', created: Date.now() }
    ];
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
