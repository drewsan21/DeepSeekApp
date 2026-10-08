// ============================================================================
// MCP Server Management UI - Server list, start/stop, configuration
// ============================================================================

import { useState } from 'react';
import { useStore } from '../store';
import {
  Server,
  Play,
  Square,
  Settings,
  CheckCircle,
  XCircle,
  Loader,
  Wrench,
} from 'lucide-react';

export function MCPServerManager() {
  const { mcpServers, startMCPServer, stopMCPServer, mcpServerStatus } =
    useStore();

  const [showConfig, setShowConfig] = useState(false);
  const [configuringServer, setConfiguringServer] = useState<string | null>(
    null
  );
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  const handleStart = async (serverId: string) => {
    await startMCPServer(serverId);
  };

  const handleStop = async (serverId: string) => {
    await stopMCPServer(serverId);
  };

  const handleConfigure = (serverId: string) => {
    setConfiguringServer(serverId);
    setShowConfig(true);
    setEnvVars({});
  };

  const handleSaveConfig = async () => {
    if (configuringServer) {
      // In a real implementation, this would save the config
      console.log('Saving config for', configuringServer, envVars);
      setShowConfig(false);
      setConfiguringServer(null);
      setEnvVars({});
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stopped':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'starting':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500/10 border-green-500/20';
      case 'stopped':
        return 'bg-gray-500/10 border-gray-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'starting':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">MCP Servers</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Server className="w-4 h-4" />
          <span>
            {mcpServers.filter((s) => mcpServerStatus[s.id] === 'running').length}{' '}
            / {mcpServers.length} running
          </span>
        </div>
      </div>

      {/* Server List */}
      <div className="space-y-3">
        {mcpServers.map((server) => {
          const status = mcpServerStatus[server.id] || 'stopped';
          const isRunning = status === 'running';
          const isStarting = status === 'starting';

          return (
            <div
              key={server.id}
              className={`p-4 rounded-xl border ${getStatusColor(status)} transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Server className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100 mb-1">
                      {server.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {server.description}
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-xs text-gray-400 capitalize">
                        {status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Configure Button */}
                  <button
                    onClick={() => handleConfigure(server.id)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Configure"
                  >
                    <Settings className="w-4 h-4 text-gray-300" />
                  </button>

                  {/* Start/Stop Button */}
                  {isRunning ? (
                    <button
                      onClick={() => handleStop(server.id)}
                      disabled={isStarting}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      <span className="text-sm">Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStart(server.id)}
                      disabled={isStarting}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span className="text-sm">Start</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tools List */}
              {server.tools && server.tools.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {server.tools.length} tools available
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {server.tools.slice(0, 5).map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 text-xs bg-gray-800 rounded text-gray-300"
                      >
                        {tool}
                      </span>
                    ))}
                    {server.tools.length > 5 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-800 rounded text-gray-400">
                        +{server.tools.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {showConfig && configuringServer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Configure MCP Server
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Environment Variables
                </label>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      placeholder="API_KEY"
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-2"
                    />
                    <input
                      type="password"
                      placeholder="Value"
                      value={envVars['API_KEY'] || ''}
                      onChange={(e) =>
                        setEnvVars({ ...envVars, API_KEY: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Add environment variables required by this server
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfig(false);
                    setConfiguringServer(null);
                    setEnvVars({});
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
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
