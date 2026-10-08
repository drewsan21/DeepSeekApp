// ============================================================================
// Provider Registry - Central registry for all AI providers
// ============================================================================

import type { ProviderConfig, ProviderType } from './extended-types';

// ============================================================================
// PROVIDER DEFINITIONS
// ============================================================================

export const PROVIDER_REGISTRY: Record<string, ProviderConfig> = {
  // DeepSeek Providers
  'deepseek-api': {
    id: 'deepseek-api',
    type: 'deepseek-api',
    label: 'DeepSeek API',
    description: 'DeepSeek API with direct key authentication',
    needsApiKey: true,
    needsAccount: false,
    isLocal: false,
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: false,
      computerUse: false,
      browserUse: false,
      codeExecution: false,
      fileAccess: false,
    },
  },

  'deepseek-account': {
    id: 'deepseek-account',
    type: 'deepseek-account',
    label: 'DeepSeek Account',
    description: 'DeepSeek web account authentication',
    needsApiKey: false,
    needsAccount: true,
    isLocal: false,
    defaultBaseUrl: 'https://chat.deepseek.com',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: false,
      computerUse: false,
      browserUse: false,
      codeExecution: false,
      fileAccess: false,
    },
  },

  // Qwen Providers
  'qwen-account': {
    id: 'qwen-account',
    type: 'qwen-account',
    label: 'Qwen Account',
    description: 'Alibaba Qwen cloud account',
    needsApiKey: false,
    needsAccount: true,
    isLocal: false,
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: true,
      computerUse: false,
      browserUse: false,
      codeExecution: false,
      fileAccess: false,
    },
  },

  'qwen-local': {
    id: 'qwen-local',
    type: 'qwen-local',
    label: 'Qwen Local (Qwen Studio)',
    description: 'Local Qwen model via Qwen Studio Desktop',
    needsApiKey: false,
    needsAccount: false,
    isLocal: true,
    defaultBaseUrl: 'http://localhost:8080/v1',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: false,
      computerUse: false,
      browserUse: false,
      codeExecution: true,
      fileAccess: true,
    },
  },

  // Custom OpenAI-Compatible
  'custom-openai': {
    id: 'custom-openai',
    type: 'custom-openai',
    label: 'Custom OpenAI-Compatible',
    description: 'Any OpenAI-compatible API endpoint',
    needsApiKey: true,
    needsAccount: false,
    isLocal: false,
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: false,
      computerUse: false,
      browserUse: false,
      codeExecution: false,
      fileAccess: false,
    },
  },

  // Local Models
  'local-model': {
    id: 'local-model',
    type: 'local-model',
    label: 'Local Model',
    description: 'Local LLM (Ollama, llama.cpp, etc.)',
    needsApiKey: false,
    needsAccount: false,
    isLocal: true,
    defaultBaseUrl: 'http://localhost:11434/v1',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: false,
      vision: false,
      computerUse: false,
      browserUse: false,
      codeExecution: false,
      fileAccess: true,
    },
  },
};

// ============================================================================
// PROVIDER REGISTRY FUNCTIONS
// ============================================================================

export function getProvider(id: string): ProviderConfig | undefined {
  return PROVIDER_REGISTRY[id];
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(PROVIDER_REGISTRY);
}

export function getProvidersByType(type: ProviderType): ProviderConfig[] {
  return Object.values(PROVIDER_REGISTRY).filter((p) => p.type === type);
}

export function getLocalProviders(): ProviderConfig[] {
  return Object.values(PROVIDER_REGISTRY).filter((p) => p.isLocal);
}

export function getCloudProviders(): ProviderConfig[] {
  return Object.values(PROVIDER_REGISTRY).filter((p) => !p.isLocal);
}

export function getProvidersWithCapability(
  capability: keyof ProviderConfig['capabilities']
): ProviderConfig[] {
  return Object.values(PROVIDER_REGISTRY).filter(
    (p) => p.capabilities[capability]
  );
}

// ============================================================================
// MODEL DEFINITIONS
// ============================================================================

export interface ModelDefinition {
  id: string;
  providerId: string;
  name: string;
  description: string;
  contextSize: number;
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  supportsStreaming: boolean;
}

export const MODEL_REGISTRY: Record<string, ModelDefinition> = {
  // DeepSeek Models
  'deepseek-chat': {
    id: 'deepseek-chat',
    providerId: 'deepseek-api',
    name: 'DeepSeek Chat',
    description: 'DeepSeek general purpose chat model',
    contextSize: 64000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
  'deepseek-coder': {
    id: 'deepseek-coder',
    providerId: 'deepseek-api',
    name: 'DeepSeek Coder',
    description: 'DeepSeek specialized for code',
    contextSize: 64000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
  'deepseek-reasoner': {
    id: 'deepseek-reasoner',
    providerId: 'deepseek-api',
    name: 'DeepSeek Reasoner',
    description: 'DeepSeek reasoning model',
    contextSize: 64000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },

  // Qwen Models
  'qwen-max': {
    id: 'qwen-max',
    providerId: 'qwen-account',
    name: 'Qwen Max',
    description: 'Qwen flagship model',
    contextSize: 32000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
  'qwen-plus': {
    id: 'qwen-plus',
    providerId: 'qwen-account',
    name: 'Qwen Plus',
    description: 'Qwen balanced model',
    contextSize: 32000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
  'qwen-turbo': {
    id: 'qwen-turbo',
    providerId: 'qwen-account',
    name: 'Qwen Turbo',
    description: 'Qwen fast model',
    contextSize: 8000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
  'qwen-coder': {
    id: 'qwen-coder',
    providerId: 'qwen-account',
    name: 'Qwen Coder',
    description: 'Qwen specialized for code',
    contextSize: 32000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },

  // Qwen Local Models (via Qwen Studio)
  'qwen2.5-coder-7b': {
    id: 'qwen2.5-coder-7b',
    providerId: 'qwen-local',
    name: 'Qwen 2.5 Coder 7B',
    description: 'Local Qwen coder model (7B parameters)',
    contextSize: 32000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
  'qwen2.5-14b': {
    id: 'qwen2.5-14b',
    providerId: 'qwen-local',
    name: 'Qwen 2.5 14B',
    description: 'Local Qwen general model (14B parameters)',
    contextSize: 32000,
    supportsVision: false,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
  'qwen2.5-vl-7b': {
    id: 'qwen2.5-vl-7b',
    providerId: 'qwen-local',
    name: 'Qwen 2.5 VL 7B',
    description: 'Local Qwen vision-language model (7B parameters)',
    contextSize: 8000,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsStreaming: true,
  },
};

// ============================================================================
// MODEL REGISTRY FUNCTIONS
// ============================================================================

export function getModel(id: string): ModelDefinition | undefined {
  return MODEL_REGISTRY[id];
}

export function getModelsForProvider(providerId: string): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY).filter(
    (m) => m.providerId === providerId
  );
}

export function getAllModels(): ModelDefinition[] {
  return Object.values(MODEL_REGISTRY);
}
