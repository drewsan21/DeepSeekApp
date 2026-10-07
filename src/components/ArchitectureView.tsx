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
  Zap
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
    </div>
  )
}
