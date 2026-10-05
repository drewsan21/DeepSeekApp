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
  Network
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
    </div>
  )
}
