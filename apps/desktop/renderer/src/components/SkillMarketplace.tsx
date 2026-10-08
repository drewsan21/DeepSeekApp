// ============================================================================
// Skill Marketplace UI - Skill installation and configuration
// ============================================================================

import { useState } from 'react';
import { useStore } from '../store';
import {
  Package,
  Download,
  Trash2,
  Check,
  X,
  Settings,
  Search,
  Filter,
} from 'lucide-react';

export function SkillMarketplace() {
  const {
    installedSkills,
    availableSkills,
    installSkill,
    uninstallSkill,
    enableSkill,
    disableSkill,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showInstalled, setShowInstalled] = useState(true);

  const allSkills = [...installedSkills, ...availableSkills];

  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch =
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || skill.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(allSkills.map((s) => s.category)));

  const handleInstall = async (skillId: string) => {
    await installSkill(skillId);
  };

  const handleUninstall = async (skillId: string) => {
    await uninstallSkill(skillId);
  };

  const handleToggle = async (skillId: string, isEnabled: boolean) => {
    if (isEnabled) {
      await disableSkill(skillId);
    } else {
      await enableSkill(skillId);
    }
  };

  const getSkillIcon = (category: string) => {
    switch (category) {
      case 'computer-use':
        return '🖱️';
      case 'browser-use':
        return '🌐';
      case 'file-management':
        return '📁';
      case 'code-analysis':
        return '🔍';
      case 'data-processing':
        return '📊';
      case 'communication':
        return '💬';
      case 'integration':
        return '🔗';
      case 'utility':
        return '🛠️';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Skill Marketplace</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Package className="w-4 h-4" />
          <span>
            {installedSkills.length} installed / {allSkills.length} available
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSkills.map((skill) => {
          const isInstalled = installedSkills.some((s) => s.id === skill.id);

          return (
            <div
              key={skill.id}
              className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">{getSkillIcon(skill.category)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-100">
                      {skill.name}
                    </h3>
                    {isInstalled && (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 rounded">
                        Installed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {skill.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>v{skill.version}</span>
                    <span>•</span>
                    <span>{skill.author}</span>
                    <span>•</span>
                    <span className="capitalize">{skill.category}</span>
                  </div>
                </div>
              </div>

              {/* Tools */}
              {skill.tools && skill.tools.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">
                    Provides {skill.tools.length} tools:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skill.tools.slice(0, 3).map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 text-xs bg-gray-700 rounded text-gray-300"
                      >
                        {tool}
                      </span>
                    ))}
                    {skill.tools.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-700 rounded text-gray-400">
                        +{skill.tools.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isInstalled ? (
                  <>
                    <button
                      onClick={() => handleToggle(skill.id, skill.isEnabled)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        skill.isEnabled
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {skill.isEnabled ? (
                        <>
                          <Check className="w-4 h-4" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          Disabled
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleUninstall(skill.id)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      title="Uninstall"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleInstall(skill.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No skills found matching your criteria
        </div>
      )}
    </div>
  );
}
