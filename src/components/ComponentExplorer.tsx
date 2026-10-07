import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Package,
  ChevronRight,
  Code,
  FileCode,
  Folder,
  ArrowRight,
  Layers,
  Terminal,
  Globe,
  Key,
  Shield,
  Database,
  Cpu,
  Monitor,
  Network,
  Zap,
  Menu
} from 'lucide-react'

interface ComponentDef {
  name: string
  package: string
  description: string
  interfaces: string[]
  icon: React.ReactNode
  color: string
}

const components: ComponentDef[] = [
  {
    name: 'AuthProvider',
    package: '@deepseek/auth',
    description: 'Handles authentication flows for DeepSeek accounts and API keys',
    interfaces: ['beginLogin()', 'completeLogin()', 'logout()', 'getStatus()'],
    icon: <Key size={18} />,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    name: 'ModelProvider',
    package: '@deepseek/providers',
    description: 'Abstract interface for all model providers (API, account, local, custom)',
    interfaces: ['authenticate()', 'listModels()', 'chat()', 'stream()', 'capabilities()'],
    icon: <Layers size={18} />,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  {
    name: 'SecretStore',
    package: '@deepseek/secrets',
    description: 'Secure credential storage using Linux Secret Service/keyring',
    interfaces: ['set()', 'get()', 'delete()', 'has()'],
    icon: <Database size={18} />,
    color: 'text-green-400 bg-green-500/10 border-green-500/20'
  },
  {
    name: 'Harness',
    package: '@deepseek/harness',
    description: 'Adapter around existing DeepSeek Harness for agent task execution',
    interfaces: ['start()', 'stop()', 'status()', 'run()', 'stream()'],
    icon: <Cpu size={18} />,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
  },
  {
    name: 'BrowserManager',
    package: '@deepseek/browser',
    description: 'Manages browser tabs, navigation, and page context extraction',
    interfaces: ['createTab()', 'closeTab()', 'navigate()', 'getPageContext()', 'getSelection()'],
    icon: <Globe size={18} />,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    name: 'PermissionManager',
    package: '@deepseek/permissions',
    description: 'Granular permission system for browser actions and file access',
    interfaces: ['grantPermission()', 'revokePermission()', 'checkPermission()', 'resetSitePermissions()'],
    icon: <Shield size={18} />,
    color: 'text-red-400 bg-red-500/10 border-red-500/20'
  },
  {
    name: 'WorkspaceManager',
    package: '@deepseek/workspaces',
    description: 'Manages workspace lifecycle, persistence, and switching',
    interfaces: ['createWorkspace()', 'loadWorkspace()', 'saveWorkspace()', 'deleteWorkspace()', 'switchWorkspace()'],
    icon: <Monitor size={18} />,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'IPCBridge',
    package: '@deepseek/ipc',
    description: 'Type-safe IPC protocol between main process and renderer',
    interfaces: ['registerHandler()', 'invoke()', 'send()', 'on()'],
    icon: <Network size={18} />,
    color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
  },
]

const dataModel = [
  { table: 'accounts', fields: ['id', 'provider', 'displayName', 'email', 'avatarUrl'] },
  { table: 'providers', fields: ['id', 'type', 'config', 'isActive'] },
  { table: 'workspaces', fields: ['id', 'name', 'providerId', 'modelId', 'harnessConfig', 'createdAt'] },
  { table: 'tasks', fields: ['id', 'workspaceId', 'providerId', 'status', 'createdAt'] },
  { table: 'permissions', fields: ['origin', 'permissions[]', 'updatedAt'] },
  { table: 'settings', fields: ['key', 'value', 'scope'] },
  { table: 'history', fields: ['id', 'type', 'data', 'timestamp'] },
]

const errorCodes = [
  { code: 'AUTH_REQUIRED', desc: 'User must authenticate' },
  { code: 'AUTH_EXPIRED', desc: 'Session has expired' },
  { code: 'AUTH_FAILED', desc: 'Authentication failed' },
  { code: 'PROVIDER_UNAVAILABLE', desc: 'Provider cannot be reached' },
  { code: 'MODEL_UNAVAILABLE', desc: 'Model not accessible' },
  { code: 'HARNESS_START_FAILED', desc: 'Harness could not start' },
  { code: 'HARNESS_CRASHED', desc: 'Harness process crashed' },
  { code: 'BROWSER_DENIED', desc: 'Browser action denied' },
  { code: 'PERMISSION_DENIED', desc: 'Permission not granted' },
  { code: 'NETWORK_ERROR', desc: 'Network connectivity issue' },
  { code: 'RATE_LIMITED', desc: 'Rate limit exceeded' },
  { code: 'INVALID_REQUEST', desc: 'Malformed request' },
]

export default function ComponentExplorer() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {/* Component Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package size={18} className="text-purple-400" />
          Core Components
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {components.map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedComponent(selectedComponent === comp.name ? null : comp.name)}
              className={`
                rounded-xl border p-4 cursor-pointer transition-all
                ${selectedComponent === comp.name
                  ? `${comp.color} ring-1 ring-white/10`
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${comp.color} border`}>
                  {comp.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{comp.name}</h3>
                    <code className="text-[10px] text-gray-500 font-mono">{comp.package}</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{comp.description}</p>
                </div>
              </div>

              {selectedComponent === comp.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 pt-3 border-t border-white/5"
                >
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Interface Methods</p>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.interfaces.map(method => (
                      <code
                        key={method}
                        className="px-2 py-1 rounded bg-black/30 text-[11px] text-gray-300 font-mono border border-white/5"
                      >
                        {method}
                      </code>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Model */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database size={18} className="text-cyan-400" />
          Data Model
          <span className="text-[10px] text-gray-500 font-normal ml-2">(No credentials stored here)</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dataModel.map((table, i) => (
            <motion.div
              key={table.table}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <div className="px-3 py-2 bg-gray-800/50 border-b border-gray-800 flex items-center gap-2">
                <Folder size={12} className="text-cyan-400" />
                <code className="text-xs font-medium text-cyan-300">{table.table}</code>
              </div>
              <div className="p-3 space-y-1">
                {table.fields.map(field => (
                  <div key={field} className="flex items-center gap-2 text-[11px]">
                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                    <code className="text-gray-400 font-mono">{field}</code>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Error Codes */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal size={18} className="text-red-400" />
          Error Model
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {errorCodes.map((err, i) => (
              <div
                key={err.code}
                className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'} border-b border-gray-800/50`}
              >
                <code className="text-[11px] text-red-300 font-mono font-medium">{err.code}</code>
                <ArrowRight size={10} className="text-gray-700" />
                <span className="text-[11px] text-gray-500">{err.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code size={18} className="text-amber-400" />
          Feature Flags
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            'FEATURE_ACCOUNT_AUTH',
            'FEATURE_BROWSER',
            'FEATURE_DEEPSEEK_PLUS',
            'FEATURE_AGENT_ACTIONS',
            'FEATURE_MULTI_ACCOUNT',
            'FEATURE_LOCAL_PROVIDER',
          ].map((flag, i) => (
            <motion.div
              key={flag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500/50" />
              <code className="text-[11px] text-amber-300 font-mono">{flag}</code>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Harness Lifecycle State Machine */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Cpu size={18} className="text-orange-400" />
          Harness Lifecycle State Machine
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { state: 'stopped', color: 'bg-gray-500/10 border-gray-500/20 text-gray-400', icon: '⏹' },
              { state: 'running', color: 'bg-green-500/10 border-green-500/20 text-green-400', icon: '▶' },
              { state: 'error', color: 'bg-red-500/10 border-red-500/20 text-red-400', icon: '⚠' },
            ].map((item, i) => (
              <div key={item.state} className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`px-4 py-3 rounded-lg border ${item.color} text-center min-w-[100px]`}
                >
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div className="text-xs font-medium">{item.state}</div>
                </motion.div>
                {i < 2 && (
                  <div className="flex flex-col items-center gap-0.5">
                    <ArrowRight size={14} className="text-gray-600" />
                    <span className="text-[9px] text-gray-600">start/stop</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded-lg bg-gray-800/30 border border-gray-800">
              <div className="text-[10px] text-gray-500 mb-1">Transitions</div>
              <div className="text-[11px] text-gray-300">stopped → running</div>
              <div className="text-[11px] text-gray-300">running → stopped</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-800/30 border border-gray-800">
              <div className="text-[10px] text-gray-500 mb-1">Error Recovery</div>
              <div className="text-[11px] text-gray-300">error → stopped</div>
              <div className="text-[11px] text-gray-300">error → running</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-800/30 border border-gray-800">
              <div className="text-[10px] text-gray-500 mb-1">Methods</div>
              <code className="text-[10px] text-orange-300 font-mono">start()</code>
              <br />
              <code className="text-[10px] text-orange-300 font-mono">stop()</code>
              <br />
              <code className="text-[10px] text-orange-300 font-mono">status()</code>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Type Registry */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          Provider Type Registry
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { type: 'deepseek-api', label: 'DeepSeek API', desc: 'Direct API key authentication', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { type: 'deepseek-account', label: 'DeepSeek Account', desc: 'Web session authentication', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { type: 'custom-openai', label: 'Custom OpenAI Compatible', desc: 'Third-party OpenAI-compatible APIs', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
            { type: 'local-model', label: 'Local Model', desc: 'Local LLM (Ollama, llama.cpp, etc.)', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
          ].map((provider, i) => (
            <motion.div
              key={provider.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-4 rounded-xl border ${provider.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">{provider.label}</h3>
                <code className="text-[10px] text-gray-500 font-mono">{provider.type}</code>
              </div>
              <p className="text-xs text-gray-400">{provider.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 text-gray-400 border border-white/5">
                  authenticate()
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 text-gray-400 border border-white/5">
                  listModels()
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 text-gray-400 border border-white/5">
                  chat()
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-black/20 text-gray-400 border border-white/5">
                  stream()
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Process Communication Pattern */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal size={18} className="text-orange-400" />
          Harness Process Communication
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Spawn Configuration</h3>
              <div className="space-y-1.5">
                {[
                  { prop: 'command', value: 'deepseek-harness' },
                  { prop: 'args', value: '--stdio --no-color' },
                  { prop: 'env.NODE_ENV', value: 'production' },
                ].map(item => (
                  <div key={item.prop} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                    <code className="text-[11px] text-gray-400 font-mono flex-1">{item.prop}</code>
                    <code className="text-[11px] text-orange-300 font-mono">{item.value}</code>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Stream Handling</h3>
              <div className="space-y-1.5">
                {[
                  { stream: 'stdout', handler: 'JSON.parse() line-by-line', color: 'text-green-400' },
                  { stream: 'stderr', handler: 'Console error logging', color: 'text-red-400' },
                  { stream: 'stdin', handler: 'JSON.stringify() requests', color: 'text-blue-400' },
                ].map(item => (
                  <div key={item.stream} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                    <code className={`text-[11px] font-mono ${item.color}`}>{item.stream}</code>
                    <span className="text-[10px] text-gray-500">{item.handler}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <p className="text-[11px] text-gray-400">
              <span className="text-orange-400 font-medium">Buffer handling:</span>{' '}
              <code className="text-gray-300">lines.pop()</code> keeps incomplete lines in buffer for next chunk
            </p>
          </div>
        </div>
      </div>

      {/* AsyncIterable Streaming Pattern */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          AsyncIterable Streaming Pattern
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Queue-Based Iterator</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                  <div className="text-[10px] text-blue-400 mb-1">Queue</div>
                  <code className="text-[11px] text-blue-300 font-mono">HarnessEvent[]</code>
                </div>
                <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                  <div className="text-[10px] text-purple-400 mb-1">Resolve</div>
                  <code className="text-[11px] text-purple-300 font-mono">Promise&lt;T&gt;</code>
                </div>
                <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                  <div className="text-[10px] text-green-400 mb-1">Done</div>
                  <code className="text-[11px] text-green-300 font-mono">boolean</code>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Event Flow</h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  emit('event')
                </span>
                <ArrowRight size={12} className="text-gray-600" />
                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  onEvent()
                </span>
                <ArrowRight size={12} className="text-gray-600" />
                <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  resolve() or queue.push()
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
              <h3 className="text-xs font-medium text-gray-400 mb-2">Termination Conditions</h3>
              <div className="space-y-1">
                <div className="text-[11px] text-gray-400">
                  <span className="text-green-400">✓</span> event.type === 'completed'
                </div>
                <div className="text-[11px] text-gray-400">
                  <span className="text-red-400">✓</span> event.type === 'error'
                </div>
                <div className="text-[11px] text-gray-400">
                  <span className="text-amber-400">✓</span> iterator.return() called
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DeepSeekDesktopApi Bridge */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network size={18} className="text-blue-400" />
          DeepSeekDesktopApi Bridge Interface
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 mb-4">
            <code className="text-[11px] text-blue-300 font-mono block">window.deepseek: DeepSeekDesktopApi</code>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                namespace: 'auth',
                methods: ['login(): Promise<boolean>', 'logout(): Promise<void>', 'status(): Promise<AuthStatus>'],
                color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              },
              {
                namespace: 'providers',
                methods: ['list(): Promise<ProviderSummary[]>', 'select(id): Promise<void>'],
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              },
              {
                namespace: 'harness',
                methods: ['start(req): Promise<{started}>', 'stop(): Promise<void>', 'onStream(cb): () => void'],
                color: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
              },
              {
                namespace: 'browser',
                methods: ['open(url): Promise<string>', 'close(tabId): Promise<void>', 'setBounds(bounds): void', 'getPageContext(id): Promise<PageContext>', 'getActiveTab(): Promise<string>'],
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              },
              {
                namespace: 'approvals',
                methods: ['respond(id, response): Promise<void>'],
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              },
              {
                namespace: 'permissions',
                methods: ['request(permission): Promise<boolean>'],
                color: 'text-red-400 bg-red-500/10 border-red-500/20'
              },
            ].map((ns, i) => (
              <motion.div
                key={ns.namespace}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`p-3 rounded-lg border ${ns.color}`}
              >
                <h3 className="text-xs font-medium mb-2">
                  <code className="font-mono">{ns.namespace}</code>
                </h3>
                <div className="space-y-1">
                  {ns.methods.map(method => (
                    <code key={method} className="text-[10px] text-gray-400 font-mono block">
                      {method}
                    </code>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Harness Approval Response Protocol */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal size={18} className="text-amber-400" />
          Harness Approval Response Protocol
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Request Format (Harness → UI)</h3>
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <code className="text-[10px] text-amber-300 font-mono block whitespace-pre-wrap">
{`{
  "type": "approval_required",
  "approval": {
    "id": "approval-123",
    "title": "Type into search box",
    "description": "Agent wants to type query",
    "risk": "normal",
    "origin": "example.com",
    "permission": "browser.type",
    "details": { "text": "query" }
  }
}`}
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Response Format (UI → Harness)</h3>
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <code className="text-[10px] text-green-300 font-mono block whitespace-pre-wrap">
{`{
  "type": "approval_response",
  "id": "approval-123",
  "decision": "allow_once",
  "scope": "session"
}`}
                </code>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <p className="text-[11px] text-gray-400">
              <span className="text-amber-400 font-medium">Communication:</span>{' '}
              Response sent via <code className="text-gray-300">process.stdin.write(JSON.stringify(payload))</code>
            </p>
          </div>
        </div>
      </div>

      {/* BrowserManager New Methods */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe size={18} className="text-cyan-400" />
          BrowserManager New Methods
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">setBounds(bounds)</h3>
              <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                <code className="text-[10px] text-cyan-300 font-mono block whitespace-pre-wrap">
{`setBounds(bounds: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const view = this.views.get(this.activeTabId);
  if (!view) return;
  view.setBounds({
    x: Math.max(0, bounds.x),
    y: Math.max(0, bounds.y),
    width: Math.max(0, bounds.width),
    height: Math.max(0, bounds.height)
  });
}`}
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">getActiveTab()</h3>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <code className="text-[10px] text-blue-300 font-mono block whitespace-pre-wrap">
{`getActiveTab(): string | null {
  return this.activeTabId;
}`}
                </code>
              </div>
              <div className="mt-3 p-2 rounded-lg bg-gray-800/30">
                <div className="text-[10px] text-gray-500 mb-1">Purpose</div>
                <div className="text-[11px] text-gray-400">
                  Returns the currently active tab ID for page context extraction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Management System */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-blue-400" />
          Tab Management System
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">BrowserTabInfo Interface</h3>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <code className="text-[10px] text-blue-300 font-mono block whitespace-pre-wrap">
{`interface BrowserTabInfo {
  id: string;
  url: string;
  title: string;
  loading?: boolean;
}`}
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Tab Operations</h3>
              <div className="space-y-1.5">
                {[
                  { method: 'createTab(url)', desc: 'Create new tab', returns: 'tabId' },
                  { method: 'listTabs()', desc: 'Get all tabs', returns: 'BrowserTabInfo[]' },
                  { method: 'activateTab(id)', desc: 'Switch to tab', returns: 'void' },
                  { method: 'closeTab(id)', desc: 'Close and cleanup', returns: 'void' },
                ].map(item => (
                  <div key={item.method} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                    <code className="text-[11px] text-blue-300 font-mono flex-1">{item.method}</code>
                    <span className="text-[10px] text-gray-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <h3 className="text-xs font-medium text-gray-400 mb-2">Tab Events (EventEmitter)</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { event: 'tab-created', desc: 'New tab created' },
                { event: 'tab-updated', desc: 'Tab info changed' },
                { event: 'tab-closed', desc: 'Tab removed' },
              ].map(item => (
                <div key={item.event} className="p-2 rounded bg-gray-900/50 border border-gray-700">
                  <code className="text-[10px] text-blue-300 font-mono">{item.event}</code>
                  <div className="text-[9px] text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu Integration */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Menu size={18} className="text-purple-400" />
          Context Menu Integration
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Context Actions</h3>
              <div className="space-y-1.5">
                {[
                  { action: 'ask', label: 'Ask DeepSeek about selection', icon: '💬', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                  { action: 'summarize', label: 'Summarize selection', icon: '📝', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
                  { action: 'explain', label: 'Explain selection', icon: '🔍', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
                  { action: 'rewrite', label: 'Rewrite selection', icon: '✏️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                  { action: 'translate', label: 'Translate selection', icon: '🌐', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                ].map(item => (
                  <div key={item.action} className={`flex items-center gap-2 p-2 rounded-lg border ${item.color}`}>
                    <span className="text-sm">{item.icon}</span>
                    <code className="text-[11px] font-mono">{item.action}</code>
                    <span className="text-[10px] text-gray-400 ml-auto">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Context Action Payload</h3>
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <code className="text-[10px] text-purple-300 font-mono block whitespace-pre-wrap">
{`interface BrowserContextActionPayload {
  action: BrowserContextAction;
  tabId: string;
  url: string;
  title: string;
  selectionText?: string;
}`}
                </code>
              </div>
              <div className="mt-3 p-2 rounded-lg bg-gray-800/30">
                <div className="text-[10px] text-gray-500 mb-1">Trigger</div>
                <div className="text-[11px] text-gray-400">
                  Right-click on selected text → <code className="text-purple-300">context-menu</code> event
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <h3 className="text-xs font-medium text-gray-400 mb-2">Menu Structure</h3>
            <div className="flex flex-col gap-1">
              {[
                { label: 'Ask DeepSeek about selection', enabled: true },
                { label: 'Summarize selection', enabled: true },
                { label: 'Explain selection', enabled: true },
                { label: 'Rewrite selection', enabled: true },
                { label: 'Translate selection', enabled: true },
                { label: '—', separator: true },
                { label: 'Open DeepSeek panel', enabled: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 text-xs rounded ${
                    item.separator
                      ? 'border-t border-gray-700 my-1'
                      : item.enabled
                      ? 'hover:bg-purple-500/10 cursor-pointer text-gray-300'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
