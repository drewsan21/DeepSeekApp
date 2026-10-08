// ============================================================================
// Project Sync Dashboard - Sync status, pending changes
// ============================================================================

import { useState } from 'react';
import { useStore } from '../store';
import {
  GitBranch,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Sync,
  Plus,
  Trash2,
} from 'lucide-react';

export function ProjectSyncDashboard() {
  const {
    projects,
    syncProject,
    syncAllProjects,
    addProject,
    removeProject,
    isSyncing,
  } = useStore();

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectPath, setNewProjectPath] = useState('');
  const [newProjectRemote, setNewProjectRemote] = useState('');

  const handleSync = async (projectId: string) => {
    await syncProject(projectId);
  };

  const handleSyncAll = async () => {
    await syncAllProjects();
  };

  const handleAddProject = async () => {
    if (newProjectPath) {
      await addProject(newProjectPath, newProjectRemote || undefined);
      setNewProjectPath('');
      setNewProjectRemote('');
      setShowAddProject(false);
    }
  };

  const handleRemoveProject = async (projectId: string) => {
    await removeProject(projectId);
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-500/10 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'syncing':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const totalPending = projects.reduce(
    (sum, p) => sum + (p.pendingChanges || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Project Sync</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <GitBranch className="w-4 h-4" />
            <span>
              {projects.length} projects • {totalPending} pending changes
            </span>
          </div>
          <button
            onClick={() => setShowAddProject(!showAddProject)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Sync className="w-4 h-4" />
            Sync All
          </button>
        </div>
      </div>

      {/* Add Project Form */}
      {showAddProject && (
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-100 mb-3">
            Add Project
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Local Path
              </label>
              <input
                type="text"
                value={newProjectPath}
                onChange={(e) => setNewProjectPath(e.target.value)}
                placeholder="/path/to/project"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Remote URL (optional)
              </label>
              <input
                type="text"
                value={newProjectRemote}
                onChange={(e) => setNewProjectRemote(e.target.value)}
                placeholder="https://github.com/user/repo.git"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddProject(false);
                  setNewProjectPath('');
                  setNewProjectRemote('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                disabled={!newProjectPath}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No projects added yet. Click "Add Project" to get started.
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className={`p-4 rounded-xl border ${getSyncStatusColor(
                project.syncStatus || 'pending'
              )} transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <GitBranch className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100 mb-1">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {project.localPath}
                    </p>
                    <div className="flex items-center gap-2">
                      {getSyncStatusIcon(project.syncStatus || 'pending')}
                      <span className="text-xs text-gray-400 capitalize">
                        {project.syncStatus || 'pending'}
                      </span>
                      {project.pendingChanges > 0 && (
                        <span className="text-xs text-yellow-400">
                          • {project.pendingChanges} pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSync(project.id)}
                    disabled={isSyncing || project.syncStatus === 'syncing'}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        project.syncStatus === 'syncing' ? 'animate-spin' : ''
                      }`}
                    />
                    Sync
                  </button>
                  <button
                    onClick={() => handleRemoveProject(project.id)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Remote URL */}
              {project.remoteUrl && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Remote:</span>
                    <code className="text-gray-300">{project.remoteUrl}</code>
                  </div>
                </div>
              )}

              {/* Last Synced */}
              {project.lastSyncedAt && (
                <div className="mt-2 text-xs text-gray-500">
                  Last synced: {new Date(project.lastSyncedAt).toLocaleString()}
                </div>
              )}

              {/* Error Message */}
              {project.syncError && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-300">{project.syncError}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
