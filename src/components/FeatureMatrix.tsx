import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  CheckSquare,
  Check,
  X,
  Minus,
  Filter,
  Search,
  Globe,
  Terminal,
  MousePointer,
  FileText,
  Code,
  Languages,
  Camera,
  History,
  Keyboard,
  PanelRight,
  Menu
} from 'lucide-react'

interface Feature {
  name: string
  category: string
  existing: boolean
  reuse: boolean
  implement: boolean
  notes?: string
  icon: React.ReactNode
}

const features: Feature[] = [
  { name: 'Page chat', category: 'Chat', existing: true, reuse: true, implement: false, icon: <Globe size={14} /> },
  { name: 'Selected-text analysis', category: 'Chat', existing: true, reuse: true, implement: false, icon: <MousePointer size={14} /> },
  { name: 'Page summarization', category: 'Chat', existing: true, reuse: true, implement: false, icon: <FileText size={14} /> },
  { name: 'Ask about page', category: 'Chat', existing: true, reuse: true, implement: false, icon: <Globe size={14} /> },
  { name: 'Context menu', category: 'UI', existing: true, reuse: false, implement: true, notes: 'Port to Electron menu', icon: <Menu size={14} /> },
  { name: 'Side panel', category: 'UI', existing: true, reuse: false, implement: true, notes: 'React component, not webpage JS', icon: <PanelRight size={14} /> },
  { name: 'Prompt injection', category: 'Chat', existing: false, reuse: false, implement: true, notes: 'New defense layer', icon: <Terminal size={14} /> },
  { name: 'Markdown rendering', category: 'UI', existing: true, reuse: true, implement: false, icon: <FileText size={14} /> },
  { name: 'Code extraction', category: 'Content', existing: true, reuse: true, implement: false, icon: <Code size={14} /> },
  { name: 'Page translation', category: 'Chat', existing: true, reuse: true, implement: false, icon: <Languages size={14} /> },
  { name: 'Screenshot/context', category: 'Content', existing: true, reuse: false, implement: true, notes: 'Electron capture API', icon: <Camera size={14} /> },
  { name: 'History', category: 'Data', existing: true, reuse: true, implement: false, icon: <History size={14} /> },
  { name: 'Keyboard shortcuts', category: 'UI', existing: true, reuse: false, implement: true, notes: 'Electron globalShortcuts', icon: <Keyboard size={14} /> },
  { name: 'Search integration', category: 'Chat', existing: false, reuse: false, implement: true, notes: 'Command palette', icon: <Search size={14} /> },
]

const categories = ['All', 'Chat', 'UI', 'Content', 'Data']

const shortcuts = [
  { keys: 'Ctrl+Shift+D', action: 'Open DeepSeek panel' },
  { keys: 'Ctrl+Shift+A', action: 'Ask about selection' },
  { keys: 'Ctrl+Shift+S', action: 'Summarize page' },
  { keys: 'Ctrl+Shift+P', action: 'Open command palette' },
  { keys: 'Ctrl+Shift+B', action: 'Toggle browser panel' },
]

const contextMenuItems = [
  { label: 'Ask DeepSeek about selection', icon: '💬' },
  { label: 'Summarize selection', icon: '📝' },
  { label: 'Explain selection', icon: '🔍' },
  { label: 'Rewrite selection', icon: '✏️' },
  { label: 'Translate selection', icon: '🌐' },
  { label: '—', icon: '' },
  { label: 'Open DeepSeek panel', icon: '⚡' },
]

const tools = [
  { name: 'browser.get_page', category: 'Browser', risk: 'low' },
  { name: 'browser.get_selection', category: 'Browser', risk: 'low' },
  { name: 'browser.find', category: 'Browser', risk: 'low' },
  { name: 'browser.navigate', category: 'Browser', risk: 'medium' },
  { name: 'browser.click', category: 'Browser', risk: 'medium' },
  { name: 'browser.type', category: 'Browser', risk: 'high' },
  { name: 'browser.scroll', category: 'Browser', risk: 'low' },
  { name: 'deepseek.ask', category: 'AI', risk: 'low' },
  { name: 'deepseek.summarize', category: 'AI', risk: 'low' },
  { name: 'deepseek.explain', category: 'AI', risk: 'low' },
  { name: 'workspace.read', category: 'File', risk: 'medium' },
  { name: 'workspace.write', category: 'File', risk: 'high' },
]

const riskColors = {
  low: 'text-green-400 bg-green-500/10 border-green-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function FeatureMatrix() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? features : features.filter(f => f.category === filter)

  return (
    <div className="space-y-8">
      {/* Feature Matrix */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-green-400" />
          DeepSeek++ Feature Audit
        </h2>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <Filter size={14} className="text-gray-500" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === cat
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-4 py-2.5 bg-gray-800/50 border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
            <span>Feature</span>
            <span className="w-16 text-center">Existing</span>
            <span className="w-16 text-center">Reuse</span>
            <span className="w-16 text-center">Implement</span>
            <span className="w-32 text-right">Notes</span>
          </div>
          {filtered.map((feature, i) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-4 py-2.5 border-b border-gray-800/30 hover:bg-gray-800/20 items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{feature.icon}</span>
                <span className="text-xs text-gray-300">{feature.name}</span>
                <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-gray-800">{feature.category}</span>
              </div>
              <div className="w-16 flex justify-center">
                {feature.existing ? <Check size={14} className="text-green-400" /> : <X size={14} className="text-red-400" />}
              </div>
              <div className="w-16 flex justify-center">
                {feature.reuse ? <Check size={14} className="text-blue-400" /> : <Minus size={14} className="text-gray-600" />}
              </div>
              <div className="w-16 flex justify-center">
                {feature.implement ? <Check size={14} className="text-amber-400" /> : <Minus size={14} className="text-gray-600" />}
              </div>
              <div className="w-32 text-right">
                {feature.notes && <span className="text-[10px] text-gray-500">{feature.notes}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Keyboard size={18} className="text-amber-400" />
          Keyboard Shortcuts
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut, i) => (
              <motion.div
                key={shortcut.keys}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-800/30"
              >
                <span className="text-xs text-gray-400">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.split('+').map((key, j) => (
                    <span key={j} className="flex items-center gap-1">
                      <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-[11px] text-gray-300 font-mono">
                        {key}
                      </kbd>
                      {j < shortcut.keys.split('+').length - 1 && <span className="text-gray-600 text-[10px]">+</span>}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Context Menu Preview */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Menu size={18} className="text-purple-400" />
          Context Menu
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-center">
          <div className="w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            {contextMenuItems.map((item, i) => (
              <div
                key={i}
                className={`px-3 py-2 text-xs flex items-center gap-2 ${
                  item.label === '—'
                    ? 'border-t border-gray-700'
                    : 'hover:bg-blue-500/10 cursor-pointer text-gray-300'
                }`}
              >
                {item.icon && <span className="text-sm">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tool Registry */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Terminal size={18} className="text-cyan-400" />
          Tool Registry
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900 border border-gray-800"
            >
              <code className="text-[11px] text-cyan-300 font-mono">{tool.name}</code>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${riskColors[tool.risk as keyof typeof riskColors]}`}>
                {tool.risk}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
