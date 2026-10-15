import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Trash2, 
  RefreshCw, 
  Package, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';

// Extend Window interface for deepseek API
declare global {
  interface Window {
    deepseek: {
      plugins: {
        getAvailable: () => Promise<Plugin[]>;
        getInstalled: () => Promise<Plugin[]>;
        install: (pluginId: string) => Promise<void>;
        uninstall: (pluginId: string) => Promise<void>;
        update: (pluginId: string) => Promise<void>;
        isInstalled: (pluginId: string) => Promise<boolean>;
        getInfo: (pluginId: string) => Promise<Plugin | null>;
        executeCommand: (pluginId: string, command: string, args?: string[]) => Promise<any>;
      };
    };
  }
}

interface Plugin {
  id: string;
  name: string;
  description: string;
  repo: string;
  version: string;
  category: string;
  size: string;
  installCommand: string;
  features: string[];
  installedAt?: string;
  path?: string;
  status?: string;
}

const PluginInstaller = () => {
  const [availablePlugins, setAvailablePlugins] = useState<Plugin[]>([]);
  const [installedPlugins, setInstalledPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [installingPlugin, setInstallingPlugin] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      // Fetch available plugins
      const available = await window.deepseek.plugins.getAvailable();
      setAvailablePlugins(available);

      // Fetch installed plugins
      const installed = await window.deepseek.plugins.getInstalled();
      setInstalledPlugins(installed);
    } catch (err: any) {
      setError('Failed to load plugins: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const installPlugin = async (pluginId: string) => {
    setInstallingPlugin(pluginId);
    setError(null);
    
    try {
      await window.deepseek.plugins.install(pluginId);
      await loadPlugins(); // Refresh the list
    } catch (err: any) {
      setError('Failed to install plugin: ' + (err.message || 'Unknown error'));
    } finally {
      setInstallingPlugin(null);
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) {
      return;
    }

    setLoading(true);
    try {
      await window.deepseek.plugins.uninstall(pluginId);
      await loadPlugins(); // Refresh the list
    } catch (err: any) {
      setError('Failed to uninstall plugin: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const updatePlugin = async (pluginId: string) => {
    setLoading(true);
    try {
      await window.deepseek.plugins.update(pluginId);
      await loadPlugins(); // Refresh the list
    } catch (err: any) {
      setError('Failed to update plugin: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const isPluginInstalled = (pluginId: string): boolean => {
    return installedPlugins.some(p => p.id === pluginId);
  };

  const getInstalledPlugin = (pluginId: string): Plugin | undefined => {
    return installedPlugins.find(p => p.id === pluginId);
  };

  return (
    <div className="plugin-installer">
      <div className="plugin-header">
        <h2>Plugin Manager</h2>
        <button 
          onClick={loadPlugins} 
          className="refresh-btn"
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="plugin-content">
        {/* Available Plugins */}
        <div className="plugin-section">
          <h3>Available Plugins</h3>
          <div className="plugin-grid">
            {availablePlugins.map(plugin => {
              const installed = isPluginInstalled(plugin.id);
              const isInstalling = installingPlugin === plugin.id;

              return (
                <motion.div
                  key={plugin.id}
                  className={`plugin-card ${installed ? 'installed' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPlugin(plugin)}
                >
                  <div className="plugin-card-header">
                    <div className="plugin-icon">
                      <Package size={24} />
                    </div>
                    <div className="plugin-info">
                      <h4>{plugin.name}</h4>
                      <span className="plugin-category">{plugin.category}</span>
                    </div>
                    {installed && (
                      <CheckCircle size={20} className="installed-badge" />
                    )}
                  </div>

                  <p className="plugin-description">{plugin.description}</p>

                  <div className="plugin-meta">
                    <span className="plugin-version">v{plugin.version}</span>
                    <span className="plugin-size">{plugin.size}</span>
                  </div>

                  <div className="plugin-features">
                    {plugin.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="feature-tag">{feature}</span>
                    ))}
                  </div>

                  <div className="plugin-actions">
                    {installed ? (
                      <>
                        <button 
                          className="btn-update"
                          onClick={(e) => {
                            e.stopPropagation();
                            updatePlugin(plugin.id);
                          }}
                          disabled={loading}
                        >
                          <RefreshCw size={16} />
                          Update
                        </button>
                        <button 
                          className="btn-uninstall"
                          onClick={(e) => {
                            e.stopPropagation();
                            uninstallPlugin(plugin.id);
                          }}
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                          Uninstall
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-install"
                        onClick={(e) => {
                          e.stopPropagation();
                          installPlugin(plugin.id);
                        }}
                        disabled={isInstalling}
                      >
                        {isInstalling ? (
                          <>
                            <RefreshCw size={16} className="spinning" />
                            Installing...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Install
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Installed Plugins */}
        {installedPlugins.length > 0 && (
          <div className="plugin-section">
            <h3>Installed Plugins ({installedPlugins.length})</h3>
            <div className="installed-list">
              {installedPlugins.map(plugin => (
                <div key={plugin.id} className="installed-item">
                  <Package size={20} />
                  <div className="installed-info">
                    <span className="installed-name">{plugin.name}</span>
                    <span className="installed-version">v{plugin.version}</span>
                  </div>
                  <div className="installed-actions">
                    <button 
                      className="btn-small"
                      onClick={() => updatePlugin(plugin.id)}
                      disabled={loading}
                    >
                      <RefreshCw size={14} />
                    </button>
                    <button 
                      className="btn-small btn-danger"
                      onClick={() => uninstallPlugin(plugin.id)}
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plugin Details Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <motion.div
            className="plugin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPlugin(null)}
          >
            <motion.div
              className="plugin-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{selectedPlugin.name}</h3>
                <button onClick={() => setSelectedPlugin(null)}>×</button>
              </div>

              <div className="modal-content">
                <div className="modal-section">
                  <h4>Description</h4>
                  <p>{selectedPlugin.description}</p>
                </div>

                <div className="modal-section">
                  <h4>Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Version:</span>
                      <span className="detail-value">{selectedPlugin.version}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{selectedPlugin.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{selectedPlugin.size}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Repository:</span>
                      <a 
                        href={selectedPlugin.repo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="detail-link"
                      >
                        <ExternalLink size={14} />
                        View on GitHub
                      </a>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4>Features</h4>
                  <ul className="feature-list">
                    {selectedPlugin.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="modal-section">
                  <h4>Installation Command</h4>
                  <code className="install-command">
                    {selectedPlugin.installCommand}
                  </code>
                </div>
              </div>

              <div className="modal-footer">
                {isPluginInstalled(selectedPlugin.id) ? (
                  <>
                    <button 
                      className="btn-update"
                      onClick={() => updatePlugin(selectedPlugin.id)}
                      disabled={loading}
                    >
                      <RefreshCw size={16} />
                      Update Plugin
                    </button>
                    <button 
                      className="btn-uninstall"
                      onClick={() => {
                        uninstallPlugin(selectedPlugin.id);
                        setSelectedPlugin(null);
                      }}
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                      Uninstall Plugin
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn-install"
                    onClick={() => {
                      installPlugin(selectedPlugin.id);
                      setSelectedPlugin(null);
                    }}
                    disabled={installingPlugin === selectedPlugin.id}
                  >
                    {installingPlugin === selectedPlugin.id ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        Install Plugin
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .plugin-installer {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .plugin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .plugin-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background: var(--bg-tertiary);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          margin-bottom: 20px;
          color: #ef4444;
        }

        .error-banner button {
          margin-left: auto;
          background: none;
          border: none;
          color: #ef4444;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .plugin-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .plugin-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .plugin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }

        .plugin-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .plugin-card:hover {
          border-color: var(--accent-color);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .plugin-card.installed {
          border-color: rgba(34, 197, 94, 0.3);
        }

        .plugin-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .plugin-icon {
          width: 48px;
          height: 48px;
          background: var(--bg-tertiary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
        }

        .plugin-info {
          flex: 1;
        }

        .plugin-info h4 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .plugin-category {
          font-size: 12px;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .installed-badge {
          color: #22c55e;
        }

        .plugin-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .plugin-meta {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .plugin-features {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .feature-tag {
          padding: 4px 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .plugin-actions {
          display: flex;
          gap: 8px;
        }

        .btn-install,
        .btn-update,
        .btn-uninstall {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-install {
          background: var(--accent-color);
          color: white;
        }

        .btn-install:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .btn-update {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .btn-update:hover:not(:disabled) {
          background: var(--bg-quaternary);
        }

        .btn-uninstall {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .btn-uninstall:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .installed-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .installed-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .installed-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .installed-name {
          font-weight: 500;
        }

        .installed-version {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .installed-actions {
          display: flex;
          gap: 8px;
        }

        .btn-small {
          padding: 6px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-small:hover:not(:disabled) {
          background: var(--bg-quaternary);
        }

        .btn-small.btn-danger {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .btn-small.btn-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.2);
        }

        .plugin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .plugin-modal {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .modal-header button:hover {
          background: var(--bg-secondary);
        }

        .modal-content {
          padding: 24px;
        }

        .modal-section {
          margin-bottom: 24px;
        }

        .modal-section:last-child {
          margin-bottom: 0;
        }

        .modal-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-section p {
          margin: 0;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .detail-value {
          font-size: 14px;
          color: var(--text-primary);
        }

        .detail-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--accent-color);
          text-decoration: none;
          font-size: 14px;
        }

        .detail-link:hover {
          text-decoration: underline;
        }

        .feature-list {
          margin: 0;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .feature-list li {
          color: var(--text-primary);
          line-height: 1.5;
        }

        .install-command {
          display: block;
          padding: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: var(--text-primary);
          overflow-x: auto;
        }

        .modal-footer {
          padding: 20px 24px;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 12px;
        }

        .modal-footer button {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default PluginInstaller;
