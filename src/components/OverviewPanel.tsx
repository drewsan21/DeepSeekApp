import { motion } from 'framer-motion'
import {
  Terminal,
  Globe,
  Key,
  Cpu,
  Database,
  Lock,
  Eye,
  Zap,
  GitBranch,
  Server,
  Monitor,
  Users,
  Settings,
  ArrowRight,
  Package,
  Layers,
  Shield,
  CheckSquare,
  Route,
  FolderOpen
} from 'lucide-react'

const stats = [
  { label: 'Implementation Phases', value: '11', icon: <Route size={20} />, color: 'from-blue-500 to-cyan-500' },
  { label: 'Core Packages', value: '12', icon: <Package size={20} />, color: 'from-purple-500 to-pink-500' },
  { label: 'Security Controls', value: '46+', icon: <Shield size={20} />, color: 'from-green-500 to-emerald-500' },
  { label: 'Features Planned', value: '67', icon: <CheckSquare size={20} />, color: 'from-orange-500 to-amber-500' },
]

const corePrinciples = [
  {
    title: 'Harness as Agent Layer',
    description: 'The Harness remains the agent/runtime layer. Electron becomes the secure desktop/container/provider layer.',
    icon: <Cpu size={20} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    title: 'Credential Isolation',
    description: 'Credentials never pass through renderer → IPC → application. Users enter them directly in auth pages.',
    icon: <Lock size={20} />,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20'
  },
  {
    title: 'Session Separation',
    description: 'DeepSeek auth, normal browsing, and agent workspaces use separate Chromium sessions.',
    icon: <Layers size={20} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    title: 'Reuse Over Duplication',
    description: 'Prioritize reuse of existing Harness and DeepSeek++ code with adapters rather than creating independent frameworks.',
    icon: <GitBranch size={20} />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20'
  },
]

const threeExperiences = [
  {
    title: 'Web Account',
    description: 'Authenticated DeepSeek web experience',
    icon: <Globe size={24} />,
    gradient: 'from-blue-600 to-blue-800',
    items: ['Login/Logout', 'Account management', 'Web session isolation']
  },
  {
    title: 'API Provider',
    description: 'Direct API key authentication',
    icon: <Key size={24} />,
    gradient: 'from-purple-600 to-purple-800',
    items: ['API key config', 'Model selection', 'Streaming responses']
  },
  {
    title: 'Harness',
    description: 'Agent runtime and task execution',
    icon: <Terminal size={24} />,
    gradient: 'from-emerald-600 to-emerald-800',
    items: ['Task execution', 'Tool use', 'Browser actions']
  },
]

const techStack = [
  { name: 'Electron', role: 'Desktop shell', icon: <Monitor size={16} /> },
  { name: 'React', role: 'Renderer UI', icon: <Zap size={16} /> },
  { name: 'TypeScript', role: 'Type safety', icon: <Server size={16} /> },
  { name: 'Secret Service', role: 'Credential store', icon: <Lock size={16} /> },
  { name: 'Chromium', role: 'Browser engine', icon: <Globe size={16} /> },
  { name: 'IPC Bridge', role: 'Secure comms', icon: <Shield size={16} /> },
]

export default function OverviewPanel() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-blue-950/30 to-purple-950/20 border border-gray-800 p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.1),_transparent_50%)]" />
        <div className="relative">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            DeepSeek Desktop
          </h1>
          <p className="text-gray-400 text-sm lg:text-base max-w-2xl mb-6">
            A single Debian Electron/Chromium application combining the DeepSeek Harness, 
            account authentication, provider integration, and browser tooling — with 
            isolated credentials and browser sessions.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              Electron + Chromium
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">
              Debian .deb Package
            </span>
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              Linux x64 / arm64
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Core Principles */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-blue-400" />
          Core Design Principles
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {corePrinciples.map((principle, i) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-xl border p-4 ${principle.bg}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={principle.color}>{principle.icon}</span>
                <h3 className="font-medium text-sm">{principle.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{principle.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Three Experiences */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          Three DeepSeek Experiences → Unified UI
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {threeExperiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900"
            >
              <div className={`h-1 bg-gradient-to-r ${exp.gradient}`} />
              <div className="p-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${exp.gradient} flex items-center justify-center text-white mb-3`}>
                  {exp.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{exp.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{exp.description}</p>
                <ul className="space-y-1.5">
                  {exp.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1 h-1 rounded-full bg-gray-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-xs text-gray-400">
            <ArrowRight size={14} className="text-blue-400" />
            All converge through <span className="text-blue-400 font-medium">Provider Manager</span> → <span className="text-purple-400 font-medium">Desktop UI</span>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          Technology Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center"
            >
              <div className="text-gray-400 flex justify-center mb-2">{tech.icon}</div>
              <div className="text-xs font-medium">{tech.name}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">{tech.role}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* User Journey */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={18} className="text-green-400" />
          Target User Journey
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {[
              'Install .deb',
              'Launch app',
              'Sign in',
              'Configure API',
              'Open Harness',
              'Select provider',
              'Open browser',
              'Select text',
              'Ask DeepSeek',
              'Start agent',
              'Grant access',
              'Approve actions',
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-400">
                    {i + 1}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1.5 whitespace-nowrap">{step}</span>
                </div>
                {i < 11 && <ArrowRight size={12} className="text-gray-700 mb-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
