/**
 * Workspace Manager - Handles workspace persistence and management
 * Integrates with DatabaseManager for storage
 */

const { v4: uuidv4 } = require('uuid');

class WorkspaceManager {
  constructor(databaseManager) {
    this.db = databaseManager;
  }

  /**
   * Create a new workspace
   */
  createWorkspace(name, description, config = {}) {
    const id = uuidv4();
    return this.db.createWorkspace(id, name, description, config);
  }

  /**
   * Get a workspace by ID
   */
  getWorkspace(id) {
    return this.db.getWorkspace(id);
  }

  /**
   * Get all workspaces
   */
  getAllWorkspaces() {
    return this.db.getAllWorkspaces();
  }

  /**
   * Get active workspace
   */
  getActiveWorkspace() {
    return this.db.getActiveWorkspace();
  }

  /**
   * Set active workspace
   */
  setActiveWorkspace(id) {
    this.db.setActiveWorkspace(id);
  }

  /**
   * Update workspace
   */
  updateWorkspace(id, updates) {
    this.db.updateWorkspace(id, updates);
  }

  /**
   * Update workspace name
   */
  updateName(id, name) {
    this.db.updateWorkspace(id, { name });
  }

  /**
   * Update workspace description
   */
  updateDescription(id, description) {
    this.db.updateWorkspace(id, { description });
  }

  /**
   * Update workspace config
   */
  updateConfig(id, config) {
    const workspace = this.db.getWorkspace(id);
    if (workspace) {
      const updatedConfig = { ...workspace.config, ...config };
      this.db.updateWorkspace(id, { config: updatedConfig });
    }
  }

  /**
   * Delete workspace
   */
  deleteWorkspace(id) {
    this.db.deleteWorkspace(id);
  }

  /**
   * Get workspace with all related data
   */
  getWorkspaceWithDetails(id) {
    const workspace = this.db.getWorkspace(id);
    if (!workspace) return null;

    // Get related conversations
    const conversations = this.db.getAllConversations()
      .filter(conv => conv.metadata?.workspaceId === id);

    // Get related projects
    const projects = this.db.getAllProjects()
      .filter(proj => proj.metadata?.workspaceId === id);

    return {
      ...workspace,
      conversations,
      projects
    };
  }

  /**
   * Search workspaces by name or description
   */
  searchWorkspaces(query) {
    const workspaces = this.getAllWorkspaces();
    const lowerQuery = query.toLowerCase();

    return workspaces.filter(ws => 
      (ws.name && ws.name.toLowerCase().includes(lowerQuery)) ||
      (ws.description && ws.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get workspace statistics
   */
  getStats() {
    const workspaces = this.getAllWorkspaces();
    const activeWorkspace = this.getActiveWorkspace();

    return {
      totalWorkspaces: workspaces.length,
      activeWorkspaceId: activeWorkspace?.id || null,
      activeWorkspaceName: activeWorkspace?.name || null
    };
  }

  /**
   * Export workspace to JSON
   */
  exportWorkspace(id) {
    const workspace = this.getWorkspaceWithDetails(id);
    if (!workspace) return null;

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      workspace
    };
  }

  /**
   * Import workspace from JSON
   */
  importWorkspace(data) {
    try {
      const { workspace } = data;
      
      // Create new workspace with new ID
      const newId = uuidv4();
      this.db.createWorkspace(
        newId,
        `${workspace.name} (Imported)`,
        workspace.description,
        workspace.config
      );

      return newId;
    } catch (error) {
      console.error('Failed to import workspace:', error);
      return null;
    }
  }

  /**
   * Duplicate workspace
   */
  duplicateWorkspace(id) {
    const workspace = this.getWorkspace(id);
    if (!workspace) return null;

    const newId = uuidv4();
    this.db.createWorkspace(
      newId,
      `${workspace.name} (Copy)`,
      workspace.description,
      workspace.config
    );

    return newId;
  }

  /**
   * Clear all workspaces
   */
  clearAll() {
    const workspaces = this.getAllWorkspaces();
    for (const ws of workspaces) {
      this.deleteWorkspace(ws.id);
    }
  }

  /**
   * Get workspace config value
   */
  getConfigValue(id, key, defaultValue) {
    const workspace = this.db.getWorkspace(id);
    if (!workspace) return defaultValue;

    return workspace.config[key] !== undefined ? workspace.config[key] : defaultValue;
  }

  /**
   * Set workspace config value
   */
  setConfigValue(id, key, value) {
    const workspace = this.db.getWorkspace(id);
    if (workspace) {
      const config = { ...workspace.config, [key]: value };
      this.db.updateWorkspace(id, { config });
    }
  }

  /**
   * Get workspace summary (for UI display)
   */
  getWorkspaceSummary(id) {
    const workspace = this.db.getWorkspace(id);
    if (!workspace) return null;

    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      isActive: workspace.isActive,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    };
  }

  /**
   * Get all workspace summaries
   */
  getAllWorkspaceSummaries() {
    const workspaces = this.getAllWorkspaces();
    return workspaces.map(ws => this.getWorkspaceSummary(ws.id));
  }

  /**
   * Check if workspace exists
   */
  workspaceExists(id) {
    const workspace = this.db.getWorkspace(id);
    return workspace !== null;
  }

  /**
   * Get workspace by name
   */
  getWorkspaceByName(name) {
    const workspaces = this.getAllWorkspaces();
    return workspaces.find(ws => ws.name === name);
  }

  /**
   * Rename workspace
   */
  renameWorkspace(id, newName) {
    this.updateName(id, newName);
  }

  /**
   * Archive workspace (soft delete)
   */
  archiveWorkspace(id) {
    this.updateConfig(id, { archived: true, archivedAt: Date.now() });
  }

  /**
   * Unarchive workspace
   */
  unarchiveWorkspace(id) {
    const workspace = this.db.getWorkspace(id);
    if (workspace) {
      const config = { ...workspace.config };
      delete config.archived;
      delete config.archivedAt;
      this.db.updateWorkspace(id, { config });
    }
  }

  /**
   * Get archived workspaces
   */
  getArchivedWorkspaces() {
    const workspaces = this.getAllWorkspaces();
    return workspaces.filter(ws => ws.config?.archived === true);
  }

  /**
   * Get active workspaces (not archived)
   */
  getActiveWorkspaces() {
    const workspaces = this.getAllWorkspaces();
    return workspaces.filter(ws => ws.config?.archived !== true);
  }
}

module.exports = { WorkspaceManager };
