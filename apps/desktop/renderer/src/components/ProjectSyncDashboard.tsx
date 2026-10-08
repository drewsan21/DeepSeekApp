import { useState, useEffect } from 'react';
import { useStore } from '../store';

export function ProjectSyncDashboard() {
  const projects = useStore(s => s.projects);
  const loadProjects = useStore(s => s.loadProjects);
  const syncProject = useStore(s => s.syncProject);
  const syncAllProjects = useStore(s => s.syncAllProjects);

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSyncProject = async (projectId: string) => {
    await syncProject(projectId);
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    await syncAllProjects();
    setIsSyncingAll(false);
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'green';
      case 'syncing':
        return 'blue';
      case 'error':
        return 'red';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <div className="project-sync-dashboard">
      <div className="sync-header">
        <h3>Project Sync</h3>
        <button
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="sync-all-btn"
        >
          {isSyncingAll ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      <div className="project-list">
        {projects.map(project => (
          <div
            key={project.id}
            className={`project-item ${selectedProject === project.id ? 'selected' : ''}`}
            onClick={() => setSelectedProject(project.id)}
          >
            <div className="project-info">
              <span className="project-name">{project.name}</span>
              <span className="project-path">{project.path}</span>
            </div>
            <div className="project-status">
              <span className={`status-indicator ${getSyncStatusColor(project.syncStatus)}`}>
                {project.syncStatus}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSyncProject(project.id);
                }}
                disabled={project.syncStatus === 'syncing'}
                className="sync-btn"
              >
                {project.syncStatus === 'syncing' ? '⟳' : '↻'}
              </button>
            </div>

            {selectedProject === project.id && (
              <div className="project-details">
                <div className="detail-row">
                  <span className="detail-label">Remote:</span>
                  <span className="detail-value">{project.remoteUrl || 'None'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Sync:</span>
                  <span className="detail-value">
                    {project.lastSync ? new Date(project.lastSync).toLocaleString() : 'Never'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Pending Changes:</span>
                  <span className="detail-value">{project.pendingChanges}</span>
                </div>
                {project.syncError && (
                  <div className="detail-row error">
                    <span className="detail-label">Error:</span>
                    <span className="detail-value">{project.syncError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
