import { useState, useEffect } from 'react';
import { useStore } from '../store';

export function MCPServerManager() {
  const mcpServers = useStore(s => s.mcpServers);
  const loadMCPServers = useStore(s => s.loadMCPServers);
  const startMCPServer = useStore(s => s.startMCPServer);
  const stopMCPServer = useStore(s => s.stopMCPServer);

  const [expandedServer, setExpandedServer] = useState<string | null>(null);

  useEffect(() => {
    loadMCPServers();
  }, [loadMCPServers]);

  const handleToggleServer = async (serverId: string, isRunning: boolean) => {
    if (isRunning) {
      await stopMCPServer(serverId);
    } else {
      await startMCPServer(serverId);
    }
  };

  return (
    <div className="mcp-server-manager">
      <div className="mcp-header">
        <h3>MCP Servers</h3>
        <span className="mcp-count">{mcpServers.length} servers</span>
      </div>

      <div className="mcp-server-list">
        {mcpServers.map(server => (
          <div key={server.id} className="mcp-server-item">
            <div className="mcp-server-header">
              <div className="mcp-server-info">
                <span className="mcp-server-name">{server.name}</span>
                <span className={`mcp-server-status ${server.status}`}>
                  {server.status}
                </span>
              </div>
              <div className="mcp-server-actions">
                <button
                  onClick={() => handleToggleServer(server.id, server.status === 'running')}
                  className={`mcp-toggle-btn ${server.status === 'running' ? 'stop' : 'start'}`}
                >
                  {server.status === 'running' ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={() => setExpandedServer(expandedServer === server.id ? null : server.id)}
                  className="mcp-expand-btn"
                >
                  {expandedServer === server.id ? '▼' : '▶'}
                </button>
              </div>
            </div>

            {expandedServer === server.id && (
              <div className="mcp-server-details">
                <p className="mcp-server-description">{server.description}</p>
                
                {server.tools && server.tools.length > 0 && (
                  <div className="mcp-tools-section">
                    <h4>Tools ({server.tools.length})</h4>
                    <div className="mcp-tools-list">
                      {server.tools.map(tool => (
                        <div key={tool.name} className="mcp-tool-item">
                          <span className="mcp-tool-name">{tool.name}</span>
                          <span className="mcp-tool-description">{tool.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {server.resources && server.resources.length > 0 && (
                  <div className="mcp-resources-section">
                    <h4>Resources ({server.resources.length})</h4>
                    <div className="mcp-resources-list">
                      {server.resources.map(resource => (
                        <div key={resource.uri} className="mcp-resource-item">
                          <span className="mcp-resource-uri">{resource.uri}</span>
                          <span className="mcp-resource-name">{resource.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
