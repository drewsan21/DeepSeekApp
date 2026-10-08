import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStore } from './store';
import { ProviderSelector } from './components/ProviderSelector';
import { MCPServerManager } from './components/MCPServerManager';
import { GitHubIntegration } from './components/GitHubIntegration';
import { SkillMarketplace } from './components/SkillMarketplace';
import { ProjectSyncDashboard } from './components/ProjectSyncDashboard';
import { ComputerUseApproval } from './components/ComputerUseApproval';
import { BrowserUseControls } from './components/BrowserUseControls';

function TopBar() {
  const authStatus = useStore(s => s.authStatus);
  const login = useStore(s => s.login);
  const logout = useStore(s => s.logout);

  const selectedProvider = useStore(s => s.selectedProvider);
  const selectedModel = useStore(s => s.selectedModel);
  const setProvider = useStore(s => s.setProvider);
  const setModel = useStore(s => s.setModel);

  return (
    <header className="topbar">
      <strong>DeepSeek</strong>

      <select value={selectedProvider} onChange={e => setProvider(e.target.value)}>
        <option value="deepseek-account">DeepSeek Account</option>
        <option value="deepseek-api">DeepSeek API</option>
        <option value="custom-openai">Custom OpenAI</option>
        <option value="local-model">Local Model</option>
      </select>

      <select value={selectedModel} onChange={e => setModel(e.target.value)}>
        <option value="auto">Auto</option>
        <option value="deepseek-chat">deepseek-chat</option>
        <option value="deepseek-reasoner">deepseek-reasoner</option>
      </select>

      <div style={{ flex: 1 }} />

      {authStatus?.authenticated ? (
        <button onClick={() => logout()}>Sign out</button>
      ) : (
        <button onClick={() => login()}>Sign in</button>
      )}
    </header>
  );
}

function Sidebar() {
  const view = useStore(s => s.view);
  const setView = useStore(s => s.setView);

  return (
    <nav className="sidebar">
      <button className={view === 'workspace' ? 'active' : ''} onClick={() => setView('workspace')}>
        Harness
      </button>
      <button className={view === 'browser' ? 'active' : ''} onClick={() => setView('browser')}>
        Browser
      </button>
      <button className={view === 'browser-use' ? 'active' : ''} onClick={() => setView('browser-use')}>
        Browser Use
      </button>
      <div className="sidebar-divider" />
      <button className={view === 'providers' ? 'active' : ''} onClick={() => setView('providers')}>
        Providers
      </button>
      <button className={view === 'mcp' ? 'active' : ''} onClick={() => setView('mcp')}>
        MCP Servers
      </button>
      <button className={view === 'github' ? 'active' : ''} onClick={() => setView('github')}>
        GitHub
      </button>
      <button className={view === 'skills' ? 'active' : ''} onClick={() => setView('skills')}>
        Skills
      </button>
      <button className={view === 'projects' ? 'active' : ''} onClick={() => setView('projects')}>
        Projects
      </button>
      <div className="sidebar-divider" />
      <button className={view === 'settings' ? 'active' : ''} onClick={() => setView('settings')}>
        Settings
      </button>
    </nav>
  );
}

function Workspace() {
  const [prompt, setPrompt] = useState('');
  const startHarness = useStore(s => s.startHarness);
  const events = useStore(s => s.harnessEvents);
  const output = useStore(s => s.assistantOutput);

  return (
    <div className="workspace">
      <section className="panel">
        <h2>Harness</h2>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} />
        <button onClick={() => startHarness(prompt || 'Start task')}>Start task</button>
      </section>

      <section className="panel">
        <h2>Output</h2>
        <pre>{output}</pre>

        <div>
          {events.map((event, i) => (
            <div key={i} className="event">
              {event.type === 'message' && event.data}
              {event.type === 'thinking' && `Thinking: ${event.data}`}
              {event.type === 'tool_call' && `Tool call: ${event.tool}`}
              {event.type === 'tool_result' && `Tool result: ${event.tool}`}
              {event.type === 'error' && `Error: ${event.message}`}
              {event.type === 'completed' && 'Completed'}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Browser() {
  const tabs = useStore(s => s.tabs);
  const activeTabId = useStore(s => s.activeTabId);
  const browserUrl = useStore(s => s.browserUrl);
  const createTab = useStore(s => s.createTab);
  const activateTab = useStore(s => s.activateTab);
  const closeTab = useStore(s => s.closeTab);
  const setBrowserBounds = useStore(s => s.setBrowserBounds);
  const askPage = useStore(s => s.askPage);
  const output = useStore(s => s.assistantOutput);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState(browserUrl);

  useEffect(() => setDraft(browserUrl), [browserUrl]);

  useLayoutEffect(() => {
    const update = () => {
      const el = viewportRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      setBrowserBounds({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    };

    update();

    const observer = new ResizeObserver(update);
    if (viewportRef.current) observer.observe(viewportRef.current);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      setBrowserBounds({ x: 0, y: 0, width: 0, height: 0 });
    };
  }, [activeTabId, setBrowserBounds]);

  return (
    <div className="browser-layout">
      <div className="browser-main">
        <div className="tabs">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={tab.id === activeTabId ? 'tab active' : 'tab'}
              onClick={() => activateTab(tab.id)}
            >
              <span>{tab.title || tab.url}</span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTab(draft)}
          />
          <button onClick={() => createTab(draft)}>Go</button>
        </div>

        <div ref={viewportRef} className="viewport" />
      </div>

      <aside className="side-panel">
        <h2>DeepSeek</h2>

        <button onClick={() => askPage('ask')}>Ask</button>
        <button onClick={() => askPage('summarize')}>Summarize</button>
        <button onClick={() => askPage('explain')}>Explain</button>
        <button onClick={() => askPage('rewrite')}>Rewrite</button>
        <button onClick={() => askPage('translate')}>Translate</button>

        <pre>{output}</pre>
      </aside>
    </div>
  );
}

function Settings() {
  const providerConfigs = useStore(s => s.providerConfigs);
  const sitePermissions = useStore(s => s.sitePermissions);
  const configureProvider = useStore(s => s.configureProvider);
  const saveSitePermissions = useStore(s => s.saveSitePermissions);
  const resetSitePermissions = useStore(s => s.resetSitePermissions);

  return (
    <div className="settings">
      <section className="panel">
        <h2>Providers</h2>

        {providerConfigs.map(provider => (
          <ProviderRow key={provider.id} provider={provider} onSave={configureProvider} />
        ))}
      </section>

      <section className="panel">
        <h2>Permissions</h2>

        {sitePermissions.map(site => (
          <div key={site.origin} className="permission-site">
            <strong>{site.origin}</strong>
            <button onClick={() => resetSitePermissions(site.origin)}>Reset</button>

            <div>
              {site.permissions.map(p => (
                <span key={p} className="permission-pill">{p}</span>
              ))}
            </div>

            <button
              onClick={() =>
                saveSitePermissions(site.origin, [
                  ...new Set([...site.permissions, 'click'])
                ])
              }
            >
              Allow click
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

function ProviderRow({ provider, onSave }: any) {
  const [baseUrl, setBaseUrl] = useState(provider.baseUrl ?? '');
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="provider-row">
      <strong>{provider.label}</strong>
      <span>{provider.connected ? 'Configured' : 'Not configured'}</span>

      {provider.needsApiKey && (
        <>
          <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="Base URL" />
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="API key"
          />
          <button
            onClick={() =>
              onSave({
                id: provider.id,
                baseUrl: baseUrl || undefined,
                apiKey: apiKey || undefined
              })
            }
          >
            Save
          </button>
        </>
      )}
    </div>
  );
}

function ApprovalModal() {
  const approvals = useStore(s => s.approvals);
  const respondApproval = useStore(s => s.respondApproval);

  const approval = approvals[0];
  if (!approval) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{approval.title}</h2>
        <p>{approval.description}</p>

        <button onClick={() => respondApproval(approval.id, 'allow_once')}>
          Allow once
        </button>
        <button onClick={() => respondApproval(approval.id, 'allow_site')}>
          Allow for site
        </button>
        <button onClick={() => respondApproval(approval.id, 'deny')}>Deny</button>
      </div>
    </div>
  );
}

export default function App() {
  const initialize = useStore(s => s.initialize);
  const view = useStore(s => s.view);
  const setBrowserBounds = useStore(s => s.setBrowserBounds);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (view !== 'browser') {
      setBrowserBounds({ x: 0, y: 0, width: 0, height: 0 });
    }
  }, [view, setBrowserBounds]);

  return (
    <div className="app">
      <TopBar />

      <div className="body">
        <Sidebar />

        <main className="main">
          {view === 'workspace' && <Workspace />}
          {view === 'browser' && <Browser />}
          {view === 'browser-use' && <BrowserUseControls />}
          {view === 'providers' && <ProviderSelector />}
          {view === 'mcp' && <MCPServerManager />}
          {view === 'github' && <GitHubIntegration />}
          {view === 'skills' && <SkillMarketplace />}
          {view === 'projects' && <ProjectSyncDashboard />}
          {view === 'settings' && <Settings />}
        </main>
      </div>

      <ApprovalModal />
      <ComputerUseApproval />
    </div>
  );
}
