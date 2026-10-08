import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { AVAILABLE_SKILLS, getSkillById } from '@deepseek/shared';

export function SkillMarketplace() {
  const installedSkills = useStore(s => s.installedSkills);
  const installSkill = useStore(s => s.installSkill);
  const uninstallSkill = useStore(s => s.uninstallSkill);
  const enableSkill = useStore(s => s.enableSkill);
  const disableSkill = useStore(s => s.disableSkill);
  const loadSkills = useStore(s => s.loadSkills);

  const [filter, setFilter] = useState<'all' | 'installed' | 'available'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const allSkills = AVAILABLE_SKILLS;
  const installedIds = new Set(installedSkills.map(s => s.id));

  const filteredSkills = allSkills.filter(skill => {
    // Filter by installation status
    if (filter === 'installed' && !installedIds.has(skill.id)) return false;
    if (filter === 'available' && installedIds.has(skill.id)) return false;

    // Filter by category
    if (categoryFilter !== 'all' && skill.category !== categoryFilter) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        skill.name.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query) ||
        skill.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const categories = Array.from(new Set(allSkills.map(s => s.category)));

  const handleInstall = async (skillId: string) => {
    setIsInstalling(skillId);
    try {
      await installSkill(skillId);
    } finally {
      setIsInstalling(null);
    }
  };

  const handleUninstall = async (skillId: string) => {
    if (confirm('Are you sure you want to uninstall this skill?')) {
      await uninstallSkill(skillId);
    }
  };

  const handleToggle = async (skillId: string, isEnabled: boolean) => {
    if (isEnabled) {
      await disableSkill(skillId);
    } else {
      await enableSkill(skillId);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'computer-use':
        return '🖥️';
      case 'browser-use':
        return '🌐';
      case 'file-management':
        return '📁';
      case 'code-analysis':
        return '🔍';
      case 'integration':
        return '🔗';
      case 'utility':
        return '🛠️';
      case 'data-processing':
        return '📊';
      case 'communication':
        return '💬';
      default:
        return '📦';
    }
  };

  return (
    <div className="skill-marketplace">
      <div className="marketplace-header">
        <h3>Skill Marketplace</h3>
        <div className="marketplace-stats">
          <span className="stat-item">
            {installedSkills.length} installed
          </span>
          <span className="stat-item">
            {allSkills.length - installedSkills.length} available
          </span>
        </div>
      </div>

      <div className="marketplace-filters">
        <div className="filter-group">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Skills</option>
            <option value="installed">Installed</option>
            <option value="available">Available</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {getCategoryIcon(cat)} {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="skill-list">
        {filteredSkills.map(skill => {
          const isInstalled = installedIds.has(skill.id);
          const installedSkill = installedSkills.find(s => s.id === skill.id);
          const isSelected = selectedSkill === skill.id;

          return (
            <div
              key={skill.id}
              className={`skill-item ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedSkill(isSelected ? null : skill.id)}
            >
              <div className="skill-header">
                <div className="skill-icon">{getCategoryIcon(skill.category)}</div>
                <div className="skill-info">
                  <div className="skill-name-row">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-version">v{skill.version}</span>
                  </div>
                  <div className="skill-meta">
                    <span className="skill-category">{skill.category}</span>
                    <span className="skill-author">by {skill.author}</span>
                  </div>
                </div>
                <div className="skill-status">
                  {isInstalled ? (
                    <span className="status-badge installed">Installed</span>
                  ) : (
                    <span className="status-badge available">Available</span>
                  )}
                </div>
              </div>

              <p className="skill-description">{skill.description}</p>

              {isSelected && (
                <div className="skill-details">
                  <div className="skill-tools">
                    <h4>Tools ({skill.tools.length})</h4>
                    <div className="tools-list">
                      {skill.tools.map(tool => (
                        <span key={tool} className="tool-badge">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {skill.dependencies.length > 0 && (
                    <div className="skill-dependencies">
                      <h4>Dependencies</h4>
                      <div className="dependencies-list">
                        {skill.dependencies.map(dep => {
                          const depSkill = getSkillById(dep);
                          return (
                            <span key={dep} className="dependency-badge">
                              {depSkill?.name || dep}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="skill-actions">
                    {!isInstalled ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstall(skill.id);
                        }}
                        disabled={isInstalling === skill.id}
                        className="install-btn"
                      >
                        {isInstalling === skill.id ? 'Installing...' : 'Install'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(skill.id, installedSkill?.isEnabled ?? false);
                          }}
                          className={`toggle-btn ${installedSkill?.isEnabled ? 'enabled' : 'disabled'}`}
                        >
                          {installedSkill?.isEnabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUninstall(skill.id);
                          }}
                          className="uninstall-btn"
                        >
                          Uninstall
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="no-results">
          <p>No skills found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
