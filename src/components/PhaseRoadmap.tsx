import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileSearch,
  Monitor,
  Cpu,
  Key,
  Globe,
  Zap,
  Terminal,
  Shield,
  Package,
  TestTube,
  Layers
} from 'lucide-react'

interface Phase {
  id: number
  title: string
  subtitle: string
  status: 'complete' | 'active' | 'pending'
  icon: React.ReactNode
  color: string
  deliverables: string[]
  verification: string[]
}

const phases: Phase[] = [
  {
    id: 1,
    title: 'Repository Audit',
    subtitle: 'Inventory all existing DeepSeek-related directories',
    status: 'active',
    icon: <FileSearch size={18} />,
    color: 'blue',
    deliverables: [
      'architecture.md',
      'repository-inventory.md',
      'dependency-map.md',
      'feature-matrix.md',
    ],
    verification: ['No implementation yet — pure analysis']
  },
  {
    id: 2,
    title: 'Desktop Shell',
    subtitle: 'Electron main process, preload, renderer, IPC',
    status: 'pending',
    icon: <Monitor size={18} />,
    color: 'cyan',
    deliverables: [
      'Electron main process',
      'Preload script with contextBridge',
      'Renderer application shell',
      'IPC protocol',
      'Settings UI',
      'Workspace management',
    ],
    verification: ['.deb launches successfully']
  },
  {
    id: 3,
    title: 'Harness Integration',
    subtitle: 'Adapter, manager, provider integration, streaming',
    status: 'pending',
    icon: <Cpu size={18} />,
    color: 'emerald',
    deliverables: [
      'HarnessAdapter implementation',
      'HarnessManager lifecycle',
      'ProviderManager integration',
      'Streaming event pipeline',
      'Task UI',
    ],
    verification: ['Existing Harness functionality unchanged']
  },
  {
    id: 4,
    title: 'Account Authentication',
    subtitle: 'Auth manager, account manager, secret store',
    status: 'pending',
    icon: <Key size={18} />,
    color: 'purple',
    deliverables: [
      'AuthManager',
      'AccountManager',
      'AuthWindow (sandboxed)',
      'SecretStore (keyring)',
      'Login/logout flow',
      'Session lifecycle',
    ],
    verification: ['Auth works without exposing credentials to renderer']
  },
  {
    id: 5,
    title: 'Account Provider',
    subtitle: 'DeepSeek account/provider adapter',
    status: 'pending',
    icon: <Globe size={18} />,
    color: 'pink',
    deliverables: [
      'DeepSeekAccountProvider',
      'Provider discovery',
      'Model selection',
      'Request/stream handling',
      'Logout cleanup',
    ],
    verification: ['Login → provider → model → request → stream → logout cycle']
  },
  {
    id: 6,
    title: 'Browser',
    subtitle: 'Browser manager, tabs, page context, side panel',
    status: 'pending',
    icon: <Layers size={18} />,
    color: 'orange',
    deliverables: [
      'BrowserManager',
      'TabManager',
      'PageContextExtractor',
      'SidePanel component',
      'ContextMenu integration',
      'Keyboard shortcuts',
    ],
    verification: ['Browser opens, context extraction works']
  },
  {
    id: 7,
    title: 'DeepSeek++ Feature Parity',
    subtitle: 'Port extension features into desktop app',
    status: 'pending',
    icon: <Zap size={18} />,
    color: 'amber',
    deliverables: [
      'Selection analysis',
      'Page summarization',
      'Page questions',
      'Context menu actions',
      'Side panel chat',
      'Keyboard shortcuts',
      'Page extraction',
    ],
    verification: ['Feature parity with extension']
  },
  {
    id: 8,
    title: 'Agent/Browser Bridge',
    subtitle: 'Browser tools, permissions, approval UI',
    status: 'pending',
    icon: <Terminal size={18} />,
    color: 'red',
    deliverables: [
      'BrowserTools implementation',
      'PermissionManager',
      'Approval UI',
      'Action executor',
      'Prompt-injection defenses',
    ],
    verification: ['Harness can perform controlled browser interaction']
  },
  {
    id: 9,
    title: 'Security Hardening',
    subtitle: 'Full security audit and testing',
    status: 'pending',
    icon: <Shield size={18} />,
    color: 'green',
    deliverables: [
      'IPC audit',
      'Electron audit',
      'Credential audit',
      'Session isolation verification',
      'Permission audit',
      'Prompt-injection tests',
      'Dependency audit',
    ],
    verification: ['All security tests pass']
  },
  {
    id: 10,
    title: 'Packaging',
    subtitle: 'Debian .deb package production',
    status: 'pending',
    icon: <Package size={18} />,
    color: 'indigo',
    deliverables: [
      '.deb package (amd64 + arm64)',
      'Desktop entry file',
      'Application icons',
      'Uninstaller behavior',
      'Version metadata',
      'Checksums',
    ],
    verification: ['Package installs and runs on Debian/Ubuntu']
  },
  {
    id: 11,
    title: 'QA',
    subtitle: 'Cross-distribution testing',
    status: 'pending',
    icon: <TestTube size={18} />,
    color: 'teal',
    deliverables: [
      'Debian testing',
      'Ubuntu testing',
      'Linux Mint testing',
      'x86_64 verification',
      'ARM64 verification',
    ],
    verification: ['All target platforms pass']
  },
]

const statusConfig = {
  complete: { icon: <CheckCircle size={16} />, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', line: 'bg-green-500' },
  active: { icon: <Clock size={16} />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', line: 'bg-blue-500' },
  pending: { icon: <Circle size={16} />, color: 'text-gray-500', bg: 'bg-gray-800/50', border: 'border-gray-700', line: 'bg-gray-700' },
}

export default function PhaseRoadmap() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            Implementation Phases
          </h2>
          <p className="text-xs text-gray-500 mt-1">11 phases from audit to QA</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400">Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            <span className="text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Overall Progress</span>
          <span className="text-xs text-blue-400 font-medium">~8%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500 rounded-l-full" style={{ width: '0%' }} />
          <div className="h-full bg-blue-500" style={{ width: '8%' }} />
        </div>
        <div className="flex justify-between mt-2">
          {phases.map(p => (
            <div
              key={p.id}
              className={`w-2 h-2 rounded-full ${p.status === 'complete' ? 'bg-green-500' : p.status === 'active' ? 'bg-blue-500' : 'bg-gray-700'}`}
              title={`Phase ${p.id}: ${p.title}`}
            />
          ))}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="space-y-2">
        {phases.map((phase, i) => {
          const config = statusConfig[phase.status]
          const isExpanded = expandedPhase === phase.id

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
            >
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} bg-black/20`}>
                  {phase.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500">Phase {phase.id}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
                      {phase.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-200">{phase.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{phase.subtitle}</p>
                </div>
                {isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="px-4 pb-4 border-t border-gray-800/50"
                >
                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-green-400" />
                        Deliverables
                      </h4>
                      <ul className="space-y-1">
                        {phase.deliverables.map(d => (
                          <li key={d} className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-1 h-1 rounded-full bg-gray-600" />
                            <code className="text-[11px]">{d}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={12} className="text-amber-400" />
                        Verification
                      </h4>
                      <ul className="space-y-1">
                        {phase.verification.map(v => (
                          <li key={v} className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
