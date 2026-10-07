import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Monitor,
  Server,
  Shield,
  Globe,
  Key,
  Cpu,
  Database,
  Lock,
  Layers,
  ArrowDown,
  ArrowRight,
  Terminal,
  FolderOpen,
  Network,
  HardDrive,
  Package,
  Zap,
  AlertTriangle
} from 'lucide-react'

type LayerKey = 'main' | 'renderer' | 'integration' | 'harness' | 'linux'

const layers: { key: LayerKey; label: string; color: string; borderColor: string; items: string[] }[] = [
  {
    key: 'main',
    label: 'Main Process',
    color: 'from-blue-600/20 to-blue-800/10',
    borderColor: 'border-blue-500/30',
    items: ['App Lifecycle', 'Window Manager', 'Auth Manager', 'Secret Store', 'Provider Manager', 'Harness Manager', 'Permission Manager', 'IPC Router', 'Update Manager']
  },
  {
    key: 'renderer',
    label: 'Renderer',
    color: 'from-purple-600/20 to-purple-800/10',
    borderColor: 'border-purple-500/30',
    items: ['DeepSeek Account UI', 'Harness Workspace', 'Browser / Sidepanel']
  },
  {
    key: 'integration',
    label: 'Integration Layer',
    color: 'from-emerald-600/20 to-emerald-800/10',
    borderColor: 'border-emerald-500/30',
    items: ['DeepSeekProvider', 'HarnessAdapter', 'BrowserContextProvider', 'AccountProvider', 'PageContext', 'ToolExecutionBridge']
  },
  {
    key: 'harness',
    label: 'DeepSeek Harness / CLI / Agents',
    color: 'from-orange-600/20 to-orange-800/10',
    borderColor: 'border-orange-500/30',
    items: ['Agent Runtime', 'CLI Interface', 'Task Execution']
  },
  {
    key: 'linux',
    label: 'Linux Platform',
    color: 'from-gray-600/20 to-gray-800/10',
    borderColor: 'border-gray-500/30',
    items: ['Secret Service / Keyring', 'Chromium', 'Filesystem', 'Network']
  },
]

const ipcApis = [
  { path: 'window.deepseek.auth.login()', desc: 'Begin authentication flow', safe: true, channel: 'auth:login', pattern: 'invoke' },
  { path: 'window.deepseek.auth.logout()', desc: 'End authenticated session', safe: true, channel: 'auth:logout', pattern: 'invoke' },
  { path: 'window.deepseek.auth.status()', desc: 'Get auth status', safe: true, channel: 'auth:status', pattern: 'invoke' },
  { path: 'window.deepseek.providers.list()', desc: 'List available providers', safe: true, channel: 'providers:list', pattern: 'invoke' },
  { path: 'window.deepseek.providers.select()', desc: 'Select active provider', safe: true, channel: 'providers:select', pattern: 'invoke' },
  { path: 'window.deepseek.harness.start()', desc: 'Start harness process', safe: true, channel: 'harness:start', pattern: 'invoke' },
  { path: 'window.deepseek.harness.stop()', desc: 'Stop harness process', safe: true, channel: 'harness:stop', pattern: 'invoke' },
  { path: 'window.deepseek.harness.run()', desc: 'Execute harness task', safe: true, channel: 'harness:run', pattern: 'invoke' },
  { path: 'window.deepseek.harness.onStream()', desc: 'Listen to harness events', safe: true, channel: 'harness:stream', pattern: 'listen' },
  { path: 'window.deepseek.browser.open()', desc: 'Open browser tab', safe: true, channel: 'browser:open', pattern: 'invoke' },
  { path: 'window.deepseek.browser.close()', desc: 'Close browser tab', safe: true, channel: 'browser:close', pattern: 'invoke' },
  { path: 'window.deepseek.browser.getPageContext()', desc: 'Extract page context', safe: true, channel: 'browser:getContext', pattern: 'invoke' },
  { path: 'window.deepseek.permissions.request()', desc: 'Request permission', safe: true, channel: 'permissions:request', pattern: 'invoke' },
]

const blockedApis = [
  'ipcRenderer',
  'process',
  'fs',
  'child_process',
  'net',
  'shell',
]

const repoStructure = [
  { path: 'apps/desktop/electron/', desc: 'Main process, preload, windows, IPC, security', icon: <Server size={14} /> },
  { path: 'apps/desktop/renderer/', desc: 'React UI: app, auth, harness, browser, settings', icon: <Monitor size={14} /> },
  { path: 'packages/auth/', desc: 'Authentication subsystem', icon: <Key size={14} /> },
  { path: 'packages/providers/', desc: 'Provider abstraction layer', icon: <Layers size={14} /> },
  { path: 'packages/harness-adapter/', desc: 'Harness boundary adapter', icon: <Cpu size={14} /> },
  { path: 'packages/browser-bridge/', desc: 'Browser context bridge', icon: <Globe size={14} /> },
  { path: 'packages/permissions/', desc: 'Permission management', icon: <Shield size={14} /> },
  { path: 'packages/storage/', desc: 'Secret store & data', icon: <Database size={14} /> },
  { path: 'packages/ipc/', desc: 'IPC protocol definitions', icon: <Network size={14} /> },
  { path: 'extensions/deepseek-browser/', desc: 'Content scripts & bridge', icon: <Terminal size={14} /> },
  { path: 'packaging/deb/', desc: 'Debian package build', icon: <FolderOpen size={14} /> },
]

export default function ArchitectureView() {
  const [selectedLayer, setSelectedLayer] = useState<LayerKey | null>(null)

  return (
    <div className="space-y-8">
      {/* Architecture Diagram */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-blue-400" />
          System Architecture
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:p-6 space-y-3">
          {/* App title bar */}
          <div className="text-center py-2 rounded-lg bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border border-blue-500/20">
            <span className="text-sm font-bold text-blue-300">DeepSeek Desktop</span>
            <span className="text-xs text-gray-500 ml-2">Electron / Chromium</span>
          </div>

          {/* Layers */}
          {layers.map((layer, i) => (
            <div key={layer.key}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedLayer(selectedLayer === layer.key ? null : layer.key)}
                className={`
                  rounded-lg border p-3 cursor-pointer transition-all
                  bg-gradient-to-r ${layer.color} ${layer.borderColor}
                  ${selectedLayer === layer.key ? 'ring-1 ring-white/20' : 'hover:ring-1 hover:ring-white/10'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    {layer.label}
                  </span>
                  <span className="text-[10px] text-gray-500">{layer.items.length} components</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {layer.items.map(item => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded bg-black/30 text-[11px] text-gray-400 border border-white/5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={14} className="text-gray-700" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* IPC Architecture */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-green-400" />
          Secure IPC Architecture
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Allowed */}
          <div className="bg-gray-900 border border-green-500/20 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-green-500/5 border-b border-green-500/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-400">Exposed via contextBridge</span>
            </div>
            <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
              {ipcApis.map(api => (
                <div key={api.path} className="p-2 rounded-lg hover:bg-gray-800/50">
                  <div className="flex items-start gap-2">
                    <code className="text-[11px] text-green-300 font-mono flex-1">{api.path}</code>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      api.pattern === 'listen'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {api.pattern}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-[10px] text-gray-600 font-mono">channel: {api.channel}</code>
                    <span className="text-[10px] text-gray-500">— {api.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blocked */}
          <div className="bg-gray-900 border border-red-500/20 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-red-500/5 border-b border-red-500/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-medium text-red-400">Never exposed to renderer</span>
            </div>
            <div className="p-4 space-y-2">
              {blockedApis.map(api => (
                <div key={api} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                  <Lock size={12} className="text-red-400" />
                  <code className="text-xs text-red-300 font-mono">{api}</code>
                </div>
              ))}
              <div className="mt-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  <span className="text-red-400 font-medium">Security:</span> The renderer never has direct access to Node.js APIs, 
                  filesystem, or network. All operations go through validated IPC channels with permission checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monorepo Structure */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FolderOpen size={18} className="text-orange-400" />
          Monorepo Structure
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-800">
            {repoStructure.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/30 transition-colors"
              >
                <span className="text-gray-500">{item.icon}</span>
                <code className="text-xs text-blue-300 font-mono flex-1">{item.path}</code>
                <span className="text-[11px] text-gray-500 hidden sm:block">{item.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Package Boundaries */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package size={18} className="text-purple-400" />
          Package Boundaries
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            '@deepseek/shared',
            '@deepseek/auth',
            '@deepseek/secrets',
            '@deepseek/providers',
            '@deepseek/harness',
            '@deepseek/browser',
            '@deepseek/browser-tools',
            '@deepseek/permissions',
            '@deepseek/workspaces',
            '@deepseek/ipc',
            '@deepseek/ui',
            '@deepseek/desktop',
          ].map((pkg, i) => (
            <motion.div
              key={pkg}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-center"
            >
              <code className="text-[11px] text-purple-300 font-mono">{pkg}</code>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Streaming Event Flow */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          Harness Streaming Event Flow
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">invoke</span>
            <span>Request/Response</span>
            <span className="ml-4 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">listen</span>
            <span>Event Stream (AsyncIterable)</span>
          </div>
          <div className="space-y-3">
            {[
              { type: 'thinking', data: 'string', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', desc: 'Model reasoning in progress' },
              { type: 'message', data: 'string', color: 'text-green-400 bg-green-500/10 border-green-500/20', desc: 'Generated text chunk' },
              { type: 'tool_call', data: '{ tool: string, args: unknown }', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'Agent requesting tool execution' },
              { type: 'tool_result', data: '{ tool: string, result: unknown }', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', desc: 'Tool execution result' },
              { type: 'approval_required', data: '{ action: string, context: object }', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Awaiting user approval' },
              { type: 'completed', data: 'void', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', desc: 'Task finished successfully' },
              { type: 'error', data: '{ message: string }', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Error occurred' },
            ].map((event, i) => (
              <motion.div
                key={event.type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-800"
              >
                <span className={`text-[11px] px-2 py-1 rounded font-mono font-medium border ${event.color}`}>
                  {event.type}
                </span>
                <code className="text-[10px] text-gray-500 font-mono flex-1">data: {event.data}</code>
                <span className="text-[10px] text-gray-600 hidden sm:block">{event.desc}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <p className="text-[11px] text-gray-400">
              <span className="text-purple-400 font-medium">Streaming pattern:</span>{' '}
              <code className="text-gray-300">onStream(callback) → teardown()</code>{' '}
              — Returns a cleanup function to remove the IPC listener.
            </p>
          </div>
        </div>
      </div>

      {/* Native Integration Chain */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock size={18} className="text-green-400" />
          Native Secret Store Integration
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: 'LinuxSecretStore', sub: 'packages/secrets', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
              { label: 'keytar', sub: 'npm package', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { label: 'libsecret', sub: 'OS library', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { label: 'Secret Service', sub: 'D-Bus API', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded-lg border text-center ${item.color}`}>
                  <div className="text-xs font-medium">{item.label}</div>
                  <div className="text-[10px] opacity-70">{item.sub}</div>
                </div>
                {i < 3 && <ArrowRight size={14} className="text-gray-600" />}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { name: 'GNOME Keyring', distro: 'Ubuntu/Fedora' },
              { name: 'KDE KWallet', distro: 'Kubuntu/KDE' },
              { name: 'macOS Keychain', distro: 'macOS' },
            ].map(backend => (
              <div key={backend.name} className="p-2 rounded-lg bg-gray-800/30 border border-gray-800">
                <div className="text-[11px] text-gray-300 font-medium">{backend.name}</div>
                <div className="text-[10px] text-gray-600">{backend.distro}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <p className="text-[11px] text-gray-400">
              <span className="text-green-400 font-medium">SERVICE_NAME:</span>{' '}
              <code className="text-gray-300">'DeepSeek Desktop'</code>{' '}
              — All credentials stored under this service identifier in the OS keyring.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Session Isolation */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe size={18} className="text-blue-400" />
          Session Partition Isolation
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Key size={14} className="text-blue-400" />
                <h3 className="text-sm font-medium text-blue-300">Auth Partition</h3>
              </div>
              <code className="text-xs text-blue-400 font-mono block mb-2">persist:deepseek-auth</code>
              <p className="text-[11px] text-gray-400 mb-2">Isolated session for DeepSeek login</p>
              <div className="space-y-1">
                <div className="text-[10px] text-gray-500">
                  <span className="text-blue-400">URL:</span> https://chat.deepseek.com/sign_in
                </div>
                <div className="text-[10px] text-gray-500">
                  <span className="text-blue-400">Cookie:</span> user_session_token
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="text-emerald-400" />
                <h3 className="text-sm font-medium text-emerald-300">Browser Partition</h3>
              </div>
              <code className="text-xs text-emerald-400 font-mono block mb-2">persist:deepseek-browser</code>
              <p className="text-[11px] text-gray-400 mb-2">Isolated session for web browsing</p>
              <div className="space-y-1">
                <div className="text-[10px] text-gray-500">
                  <span className="text-emerald-400">Type:</span> BrowserView tabs
                </div>
                <div className="text-[10px] text-gray-500">
                  <span className="text-emerald-400">Isolation:</span> Cannot access auth cookies
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <p className="text-[11px] text-red-300">
              <AlertTriangle size={12} className="inline mr-1" />
              <span className="font-medium">Security:</span> Auth and browser sessions are completely isolated. 
              Web pages cannot access DeepSeek login cookies.
            </p>
          </div>
        </div>
      </div>

      {/* Auth Login Flow */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Key size={18} className="text-purple-400" />
          Auth Login Flow Sequence
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="space-y-2">
            {[
              { step: 1, action: 'Create BrowserWindow', detail: 'partition: persist:deepseek-auth', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { step: 2, action: 'Load login URL', detail: 'https://chat.deepseek.com/sign_in', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { step: 3, action: 'Restrict navigation', detail: 'will-navigate handler validates domains', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { step: 4, action: 'Block popups', detail: 'setWindowOpenHandler denies non-DeepSeek URLs', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
              { step: 5, action: 'Detect success', detail: 'did-navigate to /dashboard or /auth/callback', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
              { step: 6, action: 'Capture session', detail: 'Extract user_session_token cookie', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
              { step: 7, action: 'Store securely', detail: 'secretStore.set() → OS keyring', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { step: 8, action: 'Close window', detail: 'Auth window destroyed, session active', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/30"
              >
                <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${item.color}`}>
                      {item.action}
                    </span>
                  </div>
                  <code className="text-[10px] text-gray-500 font-mono mt-0.5 block">{item.detail}</code>
                </div>
                {i < 7 && <ArrowDown size={12} className="text-gray-700" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Allowed Domains */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-green-400" />
          Auth Window Allowed Domains
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              'chat.deepseek.com',
              'api.deepseek.com',
              'account.deepseek.com',
            ].map(domain => (
              <div key={domain} className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <code className="text-xs text-green-300 font-mono">{domain}</code>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <p className="text-[11px] text-gray-400">
              <span className="text-green-400 font-medium">Validation:</span>{' '}
              <code className="text-gray-300">hostname.endsWith(domain)</code> — Allows subdomains like{' '}
              <code className="text-gray-300">login.chat.deepseek.com</code>
            </p>
          </div>
        </div>
      </div>

      {/* Browser Tab Management */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor size={18} className="text-cyan-400" />
          Browser Tab Management
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">Tab Operations</h3>
              <div className="space-y-1.5">
                {[
                  { method: 'createTab(url)', desc: 'Create new BrowserView', returns: 'tabId' },
                  { method: 'activateTab(id)', desc: 'Switch to tab', returns: 'void' },
                  { method: 'closeTab(id)', desc: 'Remove and destroy', returns: 'void' },
                  { method: 'getPageContext(id)', desc: 'Extract page data', returns: 'PageContext' },
                ].map(item => (
                  <div key={item.method} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                    <code className="text-[11px] text-cyan-300 font-mono flex-1">{item.method}</code>
                    <span className="text-[10px] text-gray-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-2">BrowserView Configuration</h3>
              <div className="space-y-1.5">
                {[
                  { prop: 'nodeIntegration', value: 'false' },
                  { prop: 'contextIsolation', value: 'true' },
                  { prop: 'sandbox', value: 'true' },
                  { prop: 'partition', value: 'persist:deepseek-browser' },
                ].map(item => (
                  <div key={item.prop} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30">
                    <code className="text-[11px] text-gray-400 font-mono flex-1">{item.prop}</code>
                    <code className={`text-[11px] font-mono ${
                      item.value === 'false' ? 'text-red-400' :
                      item.value === 'true' ? 'text-green-400' :
                      'text-cyan-400'
                    }`}>
                      {item.value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Wiring Diagram */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network size={18} className="text-purple-400" />
          Engine Wiring to main.ts
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="space-y-3">
            {[
              {
                engine: 'AuthManager',
                package: '@deepseek/auth',
                ipcHandlers: ['auth:login', 'auth:status', 'auth:logout'],
                color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              },
              {
                engine: 'DeepSeekHarnessAdapter',
                package: '@deepseek/harness',
                ipcHandlers: ['harness:start', 'harness:stop', 'harness:stream'],
                color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              },
              {
                engine: 'BrowserManager',
                package: '@deepseek/browser',
                ipcHandlers: ['browser:open', 'browser:close', 'browser:context'],
                color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              },
            ].map((engine, i) => (
              <motion.div
                key={engine.engine}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 rounded-lg border ${engine.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium">{engine.engine}</h3>
                    <code className="text-[10px] text-gray-500 font-mono">{engine.package}</code>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {engine.ipcHandlers.map(handler => (
                    <span key={handler} className="text-[10px] px-2 py-0.5 rounded bg-black/20 text-gray-300 border border-white/5 font-mono">
                      {handler}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gray-800/30 border border-gray-800">
            <p className="text-[11px] text-gray-400">
              <span className="text-purple-400 font-medium">Bootstrap sequence:</span>{' '}
              <code className="text-gray-300">secretStore → authManager → harness → browserManager</code>
            </p>
          </div>
        </div>
      </div>

      {/* Renderer UI Structure */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Monitor size={18} className="text-pink-400" />
          Renderer UI Structure
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-3">Component Hierarchy</h3>
              <div className="space-y-1.5">
                {[
                  { component: 'App.tsx', desc: 'Root shell + global shortcuts', level: 0 },
                  { component: 'TopBar.tsx', desc: 'Provider/Model selection, Account', level: 1 },
                  { component: 'Sidebar.tsx', desc: 'Navigation (Harness/Browser/Settings)', level: 1 },
                  { component: 'WorkspacePanel.tsx', desc: 'Harness task surface', level: 1 },
                  { component: 'BrowserPanel.tsx', desc: 'Browser viewport + side panel', level: 1 },
                  { component: 'SettingsPanel.tsx', desc: 'Configuration UI', level: 1 },
                  { component: 'CommandPalette.tsx', desc: 'Modal command search', level: 0 },
                  { component: 'ApprovalModal.tsx', desc: 'Action approval dialogs', level: 0 },
                ].map((item, i) => (
                  <motion.div
                    key={item.component}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/30"
                    style={{ marginLeft: `${item.level * 12}px` }}
                  >
                    <code className="text-[11px] text-pink-300 font-mono">{item.component}</code>
                    <span className="text-[10px] text-gray-500">— {item.desc}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-400 mb-3">State Management</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-purple-400" />
                    <span className="text-xs font-medium text-purple-300">Zustand Store</span>
                  </div>
                  <code className="text-[10px] text-gray-400 font-mono block">useStore.ts</code>
                </div>
                <div className="space-y-1">
                  {[
                    'view: workspace | browser | settings',
                    'authStatus: AuthStatus',
                    'providers: ProviderSummary[]',
                    'selectedProvider: string',
                    'selectedModel: string',
                    'paletteOpen: boolean',
                    'approvals: ApprovalRequest[]',
                    'harnessEvents: HarnessEvent[]',
                    'activeTabId: string | null',
                    'browserUrl: string',
                  ].map(state => (
                    <div key={state} className="flex items-center gap-2 p-1.5 rounded bg-gray-800/30">
                      <div className="w-1 h-1 rounded-full bg-purple-500" />
                      <code className="text-[10px] text-gray-400 font-mono">{state}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Viewport Synchronization */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe size={18} className="text-cyan-400" />
          Browser Viewport Synchronization
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-800/30 border border-gray-800">
              <h3 className="text-xs font-medium text-gray-400 mb-2">ResizeObserver Pattern</h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  viewportRef
                </span>
                <ArrowRight size={12} className="text-gray-600" />
                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  getBoundingClientRect()
                </span>
                <ArrowRight size={12} className="text-gray-600" />
                <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  setBrowserBounds()
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-gray-800/30">
                <div className="text-[10px] text-gray-500 mb-1">BrowserBounds</div>
                <div className="space-y-0.5">
                  <code className="text-[10px] text-cyan-300 font-mono block">x: number</code>
                  <code className="text-[10px] text-cyan-300 font-mono block">y: number</code>
                  <code className="text-[10px] text-cyan-300 font-mono block">width: number</code>
                  <code className="text-[10px] text-cyan-300 font-mono block">height: number</code>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-gray-800/30">
                <div className="text-[10px] text-gray-500 mb-1">Triggers</div>
                <div className="space-y-0.5">
                  <div className="text-[10px] text-gray-400">• ResizeObserver callback</div>
                  <div className="text-[10px] text-gray-400">• Window resize event</div>
                  <div className="text-[10px] text-gray-400">• View change (hide when not browser)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Security Policy */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-green-400" />
          Renderer Content Security Policy
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 mb-4">
            <code className="text-[11px] text-green-300 font-mono block whitespace-pre-wrap">
{`default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https: wss: ws:;
object-src 'none';
frame-src 'none';`}
            </code>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { directive: "default-src 'self'", desc: 'Only load resources from same origin' },
              { directive: "script-src 'self'", desc: 'No external scripts allowed' },
              { directive: "style-src 'unsafe-inline'", desc: 'Allow inline styles (Tailwind)' },
              { directive: "object-src 'none'", desc: 'Block plugins (Flash, Java)' },
              { directive: "frame-src 'none'", desc: 'Block iframes completely' },
              { directive: "connect-src wss: ws:", desc: 'Allow WebSocket connections' },
            ].map(item => (
              <div key={item.directive} className="p-2 rounded-lg bg-gray-800/30">
                <code className="text-[10px] text-green-300 font-mono block mb-1">{item.directive}</code>
                <span className="text-[10px] text-gray-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
