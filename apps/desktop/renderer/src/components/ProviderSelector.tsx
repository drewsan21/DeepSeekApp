import { useState } from 'react';
import { useStore } from '../store';
import { PROVIDER_REGISTRY, getModelsForProvider } from '@deepseek/shared';

export function ProviderSelector() {
  const selectedProvider = useStore(s => s.selectedProvider);
  const selectedModel = useStore(s => s.selectedModel);
  const setProvider = useStore(s => s.setProvider);
  const setModel = useStore(s => s.setModel);

  const providers = Object.values(PROVIDER_REGISTRY);
  const models = getModelsForProvider(selectedProvider);

  return (
    <div className="provider-selector">
      <div className="provider-selector-header">
        <h3>Provider & Model</h3>
      </div>

      <div className="provider-selector-content">
        {/* Provider Selection */}
        <div className="provider-group">
          <label className="provider-label">Provider</label>
          <select
            value={selectedProvider}
            onChange={e => {
              setProvider(e.target.value);
              // Reset model to first available for new provider
              const newModels = getModelsForProvider(e.target.value);
              if (newModels.length > 0) {
                setModel(newModels[0].id);
              }
            }}
            className="provider-select"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.label}
              </option>
            ))}
          </select>
          <p className="provider-description">
            {providers.find(p => p.id === selectedProvider)?.description}
          </p>
        </div>

        {/* Model Selection */}
        <div className="provider-group">
          <label className="provider-label">Model</label>
          <select
            value={selectedModel}
            onChange={e => setModel(e.target.value)}
            className="provider-select"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.contextSize.toLocaleString()} context)
              </option>
            ))}
          </select>
          <p className="provider-description">
            {models.find(m => m.id === selectedModel)?.description}
          </p>
        </div>

        {/* Provider Info */}
        <div className="provider-info">
          <div className="provider-info-item">
            <span className="provider-info-label">Type:</span>
            <span className="provider-info-value">
              {providers.find(p => p.id === selectedProvider)?.isLocal ? 'Local' : 'Cloud'}
            </span>
          </div>
          <div className="provider-info-item">
            <span className="provider-info-label">Streaming:</span>
            <span className="provider-info-value">
              {providers.find(p => p.id === selectedProvider)?.capabilities.streaming ? '✓' : '✗'}
            </span>
          </div>
          <div className="provider-info-item">
            <span className="provider-info-label">Function Calling:</span>
            <span className="provider-info-value">
              {providers.find(p => p.id === selectedProvider)?.capabilities.functionCalling ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
