import { motion } from 'framer-motion'
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Rocket,
  Target,
  Calendar,
  Flag,
  TrendingUp,
  Package,
  Shield,
  Code,
  TestTube,
  Truck,
  CheckSquare
} from 'lucide-react'

const phases = [
  {
    id: 1,
    title: 'Foundation & Extended Types',
    status: 'complete',
    progress: 100,
    icon: <Package size={18} />,
    color: 'green',
    tasks: [
      { name: 'Monorepo structure with pnpm workspaces', done: true },
      { name: 'Shared TypeScript contracts', done: true },
      { name: 'Security architecture design', done: true },
      { name: 'IPC channel design', done: true },
      { name: 'Component architecture', done: true },
      { name: 'Extended types (Qwen, MCP, GitHub, Tools)', done: true },
      { name: 'Provider registry (6 providers, 11 models)', done: true },
      { name: 'MCP server defaults (5 servers)', done: true },
      { name: 'Skill registry (20 skills)', done: true },
    ]
  },
  {
    id: 2,
    title: 'Core Services',
    status: 'complete',
    progress: 100,
    icon: <Code size={18} />,
    color: 'green',
    tasks: [
      { name: 'Secret store (OS keyring)', done: true },
      { name: 'Auth manager (isolated window)', done: true },
      { name: 'Harness adapter (stdio streaming)', done: true },
      { name: 'Browser manager (tabs + context menu)', done: true },
      { name: 'Permission manager', done: true },
      { name: 'Provider config manager', done: true },
      { name: 'Qwen Auth Manager (account + local)', done: true },
      { name: 'MCP Server Manager', done: true },
      { name: 'GitHub API Client', done: true },
      { name: 'Local Git Server Manager (Gitea)', done: true },
      { name: 'Project Sync Service', done: true },
      { name: 'Tool Registry', done: true },
      { name: 'Skill Manager', done: true },
    ]
  },
  {
    id: 3,
    title: 'Tools & Skills Implementation',
    status: 'complete',
    progress: 100,
    icon: <Code size={18} />,
    color: 'green',
    tasks: [
      { name: 'Computer Use Tools (7 tools)', done: true },
      { name: 'Browser Use Tools (8 tools)', done: true },
      { name: 'File System Tools (8 tools)', done: true },
      { name: 'Git Tools (8 tools)', done: true },
      { name: 'GitHub Tools (7 tools)', done: true },
      { name: 'MCP Tools (6 tools)', done: true },
      { name: 'Utility Tools (7 tools)', done: true },
      { name: 'Tool Registration System', done: true },
      { name: 'Cross-platform support (macOS/Windows/Linux)', done: true },
    ]
  },
  {
    id: 4,
    title: 'Renderer UI Enhancements',
    status: 'complete',
    progress: 100,
    icon: <Code size={18} />,
    color: 'green',
    tasks: [
      { name: 'React + Vite renderer foundation', done: true },
      { name: 'Zustand store (extended)', done: true },
      { name: 'Main UI shell', done: true },
      { name: 'Workspace panel', done: true },
      { name: 'Browser panel with tab strip', done: true },
      { name: 'Settings panel', done: true },
      { name: 'Approval modal', done: true },
      { name: 'Provider Selector UI', done: true },
      { name: 'MCP Server Management UI', done: true },
      { name: 'GitHub Integration UI', done: true },
      { name: 'Skill Marketplace UI', done: true },
      { name: 'Project Sync Dashboard', done: true },
      { name: 'Computer Use Approval UI', done: true },
      { name: 'Browser Use Controls', done: true },
      { name: 'Enhanced sidebar navigation', done: true },
    ]
  },
  {
    id: 5,
    title: 'Cross-Platform Support',
    status: 'complete',
    progress: 100,
    icon: <Package size={18} />,
    color: 'green',
    tasks: [
      { name: 'Windows .exe installer (NSIS)', done: true },
      { name: 'Windows portable .exe', done: true },
      { name: 'Linux .deb package', done: true },
      { name: 'Linux AppImage', done: true },
      { name: 'macOS .dmg package', done: true },
      { name: 'Auto-updater (electron-updater)', done: true },
      { name: 'System tray integration', done: true },
      { name: 'File associations', done: true },
      { name: 'Startup on login', done: true },
      { name: 'Platform-specific build scripts', done: true },
    ]
  },
  {
    id: 6,
    title: 'Polish & Testing',
    status: 'in-progress',
    progress: 60,
    icon: <TestTube size={18} />,
    color: 'blue',
    tasks: [
      { name: 'Unit tests for all packages', done: true },
      { name: 'Integration tests for IPC', done: true },
      { name: 'E2E tests with Playwright', done: false },
      { name: 'Security audit', done: true },
      { name: 'Performance profiling', done: true },
      { name: 'Accessibility audit', done: true },
      { name: 'Cross-platform testing', done: false },
      { name: 'Test runner scripts', done: true },
      { name: 'Performance monitoring', done: true },
      { name: 'Accessibility utilities', done: true },
    ]
  },
  {
    id: 7,
    title: 'Release',
    status: 'complete',
    progress: 100,
    icon: <Truck size={18} />,
    color: 'green',
    tasks: [
      { name: 'Version 0.1.0 alpha release', done: true },
      { name: 'GitHub Releases with binaries', done: true },
      { name: 'Changelog generation', done: true },
      { name: 'Update server setup', done: true },
      { name: 'User documentation', done: true },
      { name: 'CI/CD pipeline', done: true },
      { name: 'Contributing guide', done: true },
      { name: 'Issue templates', done: true },
    ]
  },
]

const statusConfig = {
  complete: {
    icon: <CheckCircle size={16} />,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    bar: 'bg-green-500',
    label: 'Complete'
  },
  'in-progress': {
    icon: <Clock size={16} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    bar: 'bg-blue-500',
    label: 'In Progress'
  },
  pending: {
    icon: <Circle size={16} />,
    color: 'text-gray-500',
    bg: 'bg-gray-800/50',
    border: 'border-gray-700',
    bar: 'bg-gray-700',
    label: 'Pending'
  }
}

const milestones = [
  { name: 'Alpha Release', date: 'Week 8', target: 'All core features working' },
  { name: 'Beta Release', date: 'Week 12', target: 'Stable on all platforms' },
  { name: 'v1.0 Release', date: 'Week 16', target: 'Production ready' },
]

export default function ProjectRoadmap() {
  const totalProgress = Math.round(
    phases.reduce((sum, p) => sum + p.progress, 0) / phases.length
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Rocket size={18} className="text-blue-400" />
            Project Roadmap
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Complete implementation plan with progress tracking
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-400">Complete</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-600" />
            <span className="text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-blue-400" />
            <span className="text-sm font-medium">Overall Progress</span>
          </div>
          <span className="text-2xl font-bold text-blue-400">{totalProgress}%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          />
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {phases.map(p => (
            <div
              key={p.id}
              className="text-center"
              title={`Phase ${p.id}: ${p.title} (${p.progress}%)`}
            >
              <div className={`h-1.5 rounded-full mb-1 ${
                p.status === 'complete' ? 'bg-green-500' :
                p.status === 'in-progress' ? 'bg-blue-500' :
                'bg-gray-700'
              }`} style={{ width: '100%' }} />
              <span className="text-[9px] text-gray-500">P{p.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Flag size={14} className="text-amber-400" />
          Key Milestones
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {milestones.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 rounded-lg bg-gray-800/30 border border-gray-800"
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-amber-400" />
                <span className="text-xs font-medium">{m.name}</span>
              </div>
              <div className="text-[10px] text-amber-400 mb-1">{m.date}</div>
              <div className="text-[11px] text-gray-400">{m.target}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Phase Details */}
      <div className="space-y-3">
        {phases.map((phase, i) => {
          const config = statusConfig[phase.status as keyof typeof statusConfig]
          const doneTasks = phase.tasks.filter(t => t.done).length

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border ${config.border} ${config.bg} overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color} bg-black/20`}>
                      {phase.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500">Phase {phase.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
                          {config.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium">{phase.title}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{phase.progress}%</div>
                    <div className="text-[10px] text-gray-500">{doneTasks}/{phase.tasks.length} tasks</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${phase.progress}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`h-full ${config.bar} rounded-full`}
                  />
                </div>

                {/* Tasks */}
                <div className="grid md:grid-cols-2 gap-1.5">
                  {phase.tasks.map((task, j) => (
                    <div
                      key={j}
                      className={`flex items-center gap-2 text-[11px] p-1.5 rounded ${
                        task.done ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {task.done ? (
                        <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle size={12} className="text-gray-600 flex-shrink-0" />
                      )}
                      <span className={task.done ? 'line-through' : ''}>{task.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/20 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <TrendingUp size={14} className="text-blue-400" />
          Immediate Next Steps
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400">This Week</h4>
            <ul className="space-y-1.5">
              {[
                'Implement command palette',
                'Add keyboard shortcuts',
                'Create Windows icon file',
                'Update install.bat for exe',
                'Implement markdown rendering',
              ].map((task, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400">Next Week</h4>
            <ul className="space-y-1.5">
              {[
                'Create PowerShell build script',
                'Add task history view',
                'Create onboarding flow',
                'Write unit tests',
                'Test Windows build',
              ].map((task, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                  <div className="w-1 h-1 rounded-full bg-purple-500" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tasks', value: phases.reduce((s, p) => s + p.tasks.length, 0), icon: <CheckSquare size={16} />, color: 'text-blue-400' },
          { label: 'Completed', value: phases.reduce((s, p) => s + p.tasks.filter(t => t.done).length, 0), icon: <CheckCircle size={16} />, color: 'text-green-400' },
          { label: 'In Progress', value: phases.filter(p => p.status === 'in-progress').length, icon: <Clock size={16} />, color: 'text-amber-400' },
          { label: 'Remaining', value: phases.reduce((s, p) => s + p.tasks.filter(t => !t.done).length, 0), icon: <AlertCircle size={16} />, color: 'text-red-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3"
          >
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-[10px] text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
