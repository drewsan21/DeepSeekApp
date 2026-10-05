import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Layers,
  Route,
  Package,
  Shield,
  CheckSquare,
  FileText,
  Menu,
  X,
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
  FolderOpen,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Circle
} from 'lucide-react'
import ArchitectureView from './components/ArchitectureView'
import PhaseRoadmap from './components/PhaseRoadmap'
import ComponentExplorer from './components/ComponentExplorer'
import FeatureMatrix from './components/FeatureMatrix'
import SecurityOverview from './components/SecurityOverview'
import OverviewPanel from './components/OverviewPanel'

type View = 'overview' | 'architecture' | 'roadmap' | 'components' | 'features' | 'security'

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'architecture', label: 'Architecture', icon: <Layers size={18} /> },
  { id: 'roadmap', label: 'Roadmap', icon: <Route size={18} /> },
  { id: 'components', label: 'Components', icon: <Package size={18} /> },
  { id: 'features', label: 'Features', icon: <CheckSquare size={18} /> },
  { id: 'security', label: 'Security', icon: <Shield size={18} /> },
]

export default function App() {
  const [activeView, setActiveView] = useState<View>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 border-r border-gray-800
        flex flex-col
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Terminal size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">DeepSeek Desktop</h1>
              <p className="text-[11px] text-gray-500">Implementation Plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false) }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${activeView === item.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 border border-transparent'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Phase 1 — Planning</span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-[8%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-gray-800 flex items-center px-4 lg:px-6 gap-4 bg-gray-900/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">DeepSeek Desktop</span>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-gray-200 font-medium capitalize">{activeView}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">v0.1.0-plan</span>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              DS
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 lg:p-6 max-w-7xl mx-auto"
            >
              {activeView === 'overview' && <OverviewPanel />}
              {activeView === 'architecture' && <ArchitectureView />}
              {activeView === 'roadmap' && <PhaseRoadmap />}
              {activeView === 'components' && <ComponentExplorer />}
              {activeView === 'features' && <FeatureMatrix />}
              {activeView === 'security' && <SecurityOverview />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
