// ============================================================================
// Provider Registry Tests
// ============================================================================

import {
  getProvider,
  getAllProviders,
  getProvidersByType,
  getLocalProviders,
  getCloudProviders,
  getProvidersWithCapability,
  getModel,
  getModelsForProvider,
  getAllModels,
  PROVIDER_REGISTRY,
  MODEL_REGISTRY,
} from '../src/provider-registry';

describe('Provider Registry', () => {
  describe('getProvider', () => {
    it('should return provider by id', () => {
      const provider = getProvider('deepseek-api');
      expect(provider).toBeDefined();
      expect(provider?.id).toBe('deepseek-api');
      expect(provider?.type).toBe('deepseek-api');
    });

    it('should return undefined for non-existent provider', () => {
      const provider = getProvider('non-existent');
      expect(provider).toBeUndefined();
    });
  });

  describe('getAllProviders', () => {
    it('should return all providers', () => {
      const providers = getAllProviders();
      expect(providers.length).toBeGreaterThan(0);
      expect(providers).toContainEqual(PROVIDER_REGISTRY['deepseek-api']);
    });
  });

  describe('getProvidersByType', () => {
    it('should filter providers by type', () => {
      const providers = getProvidersByType('deepseek-api');
      expect(providers.length).toBe(1);
      expect(providers[0].type).toBe('deepseek-api');
    });

    it('should return empty array for non-existent type', () => {
      const providers = getProvidersByType('non-existent' as any);
      expect(providers).toEqual([]);
    });
  });

  describe('getLocalProviders', () => {
    it('should return only local providers', () => {
      const providers = getLocalProviders();
      expect(providers.length).toBeGreaterThan(0);
      providers.forEach((provider) => {
        expect(provider.isLocal).toBe(true);
      });
    });
  });

  describe('getCloudProviders', () => {
    it('should return only cloud providers', () => {
      const providers = getCloudProviders();
      expect(providers.length).toBeGreaterThan(0);
      providers.forEach((provider) => {
        expect(provider.isLocal).toBe(false);
      });
    });
  });

  describe('getProvidersWithCapability', () => {
    it('should filter providers by capability', () => {
      const providers = getProvidersWithCapability('streaming');
      expect(providers.length).toBeGreaterThan(0);
      providers.forEach((provider) => {
        expect(provider.capabilities.streaming).toBe(true);
      });
    });
  });
});

describe('Model Registry', () => {
  describe('getModel', () => {
    it('should return model by id', () => {
      const model = getModel('deepseek-chat');
      expect(model).toBeDefined();
      expect(model?.id).toBe('deepseek-chat');
    });

    it('should return undefined for non-existent model', () => {
      const model = getModel('non-existent');
      expect(model).toBeUndefined();
    });
  });

  describe('getModelsForProvider', () => {
    it('should return models for a provider', () => {
      const models = getModelsForProvider('deepseek-api');
      expect(models.length).toBeGreaterThan(0);
      models.forEach((model) => {
        expect(model.providerId).toBe('deepseek-api');
      });
    });

    it('should return empty array for provider with no models', () => {
      const models = getModelsForProvider('non-existent');
      expect(models).toEqual([]);
    });
  });

  describe('getAllModels', () => {
    it('should return all models', () => {
      const models = getAllModels();
      expect(models.length).toBe(Object.keys(MODEL_REGISTRY).length);
    });
  });
});
