/**
 * Qwen Provider
 * 
 * Integrates Qwen API with the DeepSeek Desktop provider system
 */

import { getQwenApiClient, QwenMessage, QwenChatRequest } from './QwenApiClient';
import { getQwenAuthService } from './QwenAuthService';

export interface QwenProviderConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class QwenProvider {
  private config: QwenProviderConfig;
  private client: ReturnType<typeof getQwenApiClient>;

  constructor(config: QwenProviderConfig) {
    this.config = config;
    this.client = getQwenApiClient();
  }

  /**
   * Check if provider is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const authService = getQwenAuthService();
    return authService.isAuthenticated();
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'Qwen';
  }

  /**
   * Get provider ID
   */
  getId(): string {
    return 'qwen';
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    try {
      const models = await this.client.listModels();
      return models.map(m => m.id);
    } catch (error) {
      console.error('Error fetching models:', error);
      // Return default models if API call fails
      return ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-coder'];
    }
  }

  /**
   * Send a chat message and get response
   */
  async chat(messages: QwenMessage[]): Promise<string> {
    const request: QwenChatRequest = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP,
    };

    const response = await this.client.chat(request);
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Send a chat message and get streaming response
   */
  async *chatStream(messages: QwenMessage[]): AsyncGenerator<string> {
    const request: QwenChatRequest = {
      model: this.config.model,
      messages,
      stream: true,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      top_p: this.config.topP,
    };

    for await (const chunk of this.client.chatStream(request)) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  /**
   * Update provider configuration
   */
  updateConfig(config: Partial<QwenProviderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): QwenProviderConfig {
    return { ...this.config };
  }
}

// Export singleton instance
let providerInstance: QwenProvider | null = null;

export function getQwenProvider(config?: QwenProviderConfig): QwenProvider {
  if (!providerInstance) {
    if (!config) {
      throw new Error('QwenProvider not initialized. Provide config on first call.');
    }
    providerInstance = new QwenProvider(config);
  } else if (config) {
    providerInstance.updateConfig(config);
  }
  return providerInstance;
}

export function resetQwenProvider(): void {
  providerInstance = null;
}
