// ============================================================================
// Provider Selector Component - Multi-provider selection UI
// ============================================================================

import { useState } from 'react';
import { useStore } from '../store';
import {
  Cloud,
  Server,
  Key,
  Check,
  Settings,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';

export function ProviderSelector() {
  const {
    providers,
    selectedProvider,
    setProvider,
    providerConfigs,
    configureProvider,
  } = useStore();

  const [showConfig, setShowConfig] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  const handleConfigure = async (providerId: string) => {
    await configureProvider({
      id: providerId,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
    });
    setApiKey('');
    setBaseUrl('');
    setEditingProvider(null);
    setShowConfig(false);
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'deepseek-api':
      case 'deepseek-account':
        return <Cloud className="w-5 h-5" />;
      case 'qwen-account':
      case 'qwen-local':
        return <Server className="w-5 h-5" />;
      default:
        return <Key className="w-5 h-5" />;
    }
  };

  const getProviderColor = (type: string) => {
    switch (type) {
      case 'deepseek-api':
      case 'deepseek-account':
        return 'from-blue-500 to-blue-600';
      case 'qwen-account':
      case 'qwen-local':
        return 'from-purple-500 to-purple-600';
      case 'custom-openai':
        return 'from-green-500 to-green-600';
      case 'local-model':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">AI Providers</h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configure
        </button>
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {providerConfigs.map((config) => (
          <div
            key={config.id}
            className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedProvider === config.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => setProvider(config.id)}
          >
            {/* Selected Indicator */}
            {selectedProvider === config.id && (
              <div className="absolute top-2 right-2">
                <Check className="w-5 h-5 text-blue-500" />
              </div>
            )}

            {/* Provider Icon */}
            <div
              className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getProviderColor(
                config.id
              )} flex items-center justify-center text-white mb-3`}
            >
              {getProviderIcon(config.id)}
            </div>

            {/* Provider Info */}
            <h3 className="font-semibold text-gray-100 mb-1">{config.label}</h3>
            <p className="text-xs text-gray-400 mb-2">
              {config.id === 'deepseek-account' && 'DeepSeek Web Account'}
              {config.id === 'deepseek-api' && 'DeepSeek API Key'}
              {config.id === 'qwen-account' && 'Qwen Cloud Account'}
              {config.id === 'qwen-local' && 'Qwen Studio Desktop'}
              {config.id === 'custom-openai' && 'Custom OpenAI Endpoint'}
              {config.id === 'local-model' && 'Local LLM (Ollama, etc.)'}
            </p>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  config.connected ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
              <span className="text-xs text-gray-400">
                {config.connected ? 'Connected' : 'Not configured'}
              </span>
            </div>

            {/* Configure Button */}
            {config.needsApiKey && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingProvider(config.id);
                  setShowConfig(true);
                }}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Edit2 className="w-3 h-3" />
                Configure
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {showConfig && editingProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Configure Provider
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Base URL (optional)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfig(false);
                    setEditingProvider(null);
                    setApiKey('');
                    setBaseUrl('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfigure(editingProvider)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
