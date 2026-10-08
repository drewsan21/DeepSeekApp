/**
 * Database Manager - SQLite-based persistent storage
 * Handles all structured data storage
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor(userDataPath) {
    this.dbPath = path.join(userDataPath, 'deepseek-desktop.db');
    this.db = null;
    this.init();
  }

  /**
   * Initialize database and create tables
   */
  init() {
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    
    // Enable WAL mode for better performance
    this.db.pragma('journal_mode = WAL');
    
    // Create tables
    this.createTables();
  }

  /**
   * Create all necessary tables
   */
  createTables() {
    // Conversations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT,
        provider_id TEXT,
        model TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        metadata TEXT
      )
    `);

    // Messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT,
        role TEXT,
        content TEXT,
        timestamp INTEGER,
        metadata TEXT,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `);

    // Workspaces table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        created_at INTEGER,
        updated_at INTEGER,
        config TEXT,
        is_active INTEGER DEFAULT 0
      )
    `);

    // Browser tabs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS browser_tabs (
        id TEXT PRIMARY KEY,
        url TEXT,
        title TEXT,
        favicon TEXT,
        position INTEGER,
        created_at INTEGER,
        is_active INTEGER DEFAULT 0
      )
    `);

    // MCP servers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS mcp_servers (
        id TEXT PRIMARY KEY,
        name TEXT,
        command TEXT,
        args TEXT,
        env TEXT,
        status TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `);

    // Skills table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT,
        version TEXT,
        enabled INTEGER DEFAULT 1,
        config TEXT,
        installed_at INTEGER
      )
    `);

    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT,
        path TEXT,
        remote_url TEXT,
        sync_status TEXT,
        last_synced_at INTEGER,
        created_at INTEGER
      )
    `);

    // Create indexes for better query performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at);
      CREATE INDEX IF NOT EXISTS idx_workspaces_active ON workspaces(is_active);
    `);
  }

  // ============================================================================
  // Conversations
  // ============================================================================

  /**
   * Create a new conversation
   */
  createConversation(id, title, providerId, model, metadata = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (id, title, provider_id, model, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = Date.now();
    stmt.run(id, title, providerId, model, now, now, JSON.stringify(metadata));
    
    return { id, title, providerId, model, createdAt: now, updatedAt: now, metadata };
  }

  /**
   * Get a conversation by ID
   */
  getConversation(id) {
    const stmt = this.db.prepare('SELECT * FROM conversations WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) return null;
    
    return {
      id: row.id,
      title: row.title,
      providerId: row.provider_id,
      model: row.model,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  /**
   * Get all conversations
   */
  getAllConversations() {
    const stmt = this.db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      providerId: row.provider_id,
      model: row.model,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  /**
   * Update conversation
   */
  updateConversation(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.metadata !== undefined) {
      fields.push('metadata = ?');
      values.push(JSON.stringify(updates.metadata));
    }
    
    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE conversations SET ${fields.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...values);
  }

  /**
   * Delete conversation
   */
  deleteConversation(id) {
    const stmt = this.db.prepare('DELETE FROM conversations WHERE id = ?');
    stmt.run(id);
  }

  // ============================================================================
  // Messages
  // ============================================================================

  /**
   * Add a message to a conversation
   */
  addMessage(id, conversationId, role, content, metadata = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (id, conversation_id, role, content, timestamp, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const now = Date.now();
    stmt.run(id, conversationId, role, content, now, JSON.stringify(metadata));
    
    // Update conversation's updated_at
    this.updateConversation(conversationId, {});
    
    return { id, conversationId, role, content, timestamp: now, metadata };
  }

  /**
   * Get all messages for a conversation
   */
  getMessages(conversationId) {
    const stmt = this.db.prepare(`
      SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC
    `);
    const rows = stmt.all(conversationId);
    
    return rows.map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  /**
   * Delete all messages for a conversation
   */
  deleteMessages(conversationId) {
    const stmt = this.db.prepare('DELETE FROM messages WHERE conversation_id = ?');
    stmt.run(conversationId);
  }

  // ============================================================================
  // Workspaces
  // ============================================================================

  /**
   * Create a new workspace
   */
  createWorkspace(id, name, description, config = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO workspaces (id, name, description, created_at, updated_at, config, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    
    const now = Date.now();
    stmt.run(id, name, description, now, now, JSON.stringify(config));
    
    return { id, name, description, createdAt: now, updatedAt: now, config, isActive: false };
  }

  /**
   * Get a workspace by ID
   */
  getWorkspace(id) {
    const stmt = this.db.prepare('SELECT * FROM workspaces WHERE id = ?');
    const row = stmt.get(id);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      config: JSON.parse(row.config || '{}'),
      isActive: row.is_active === 1
    };
  }

  /**
   * Get all workspaces
   */
  getAllWorkspaces() {
    const stmt = this.db.prepare('SELECT * FROM workspaces ORDER BY updated_at DESC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      config: JSON.parse(row.config || '{}'),
      isActive: row.is_active === 1
    }));
  }

  /**
   * Set active workspace
   */
  setActiveWorkspace(id) {
    // Deactivate all workspaces
    this.db.exec('UPDATE workspaces SET is_active = 0');
    
    // Activate the specified workspace
    const stmt = this.db.prepare('UPDATE workspaces SET is_active = 1, updated_at = ? WHERE id = ?');
    stmt.run(Date.now(), id);
  }

  /**
   * Get active workspace
   */
  getActiveWorkspace() {
    const stmt = this.db.prepare('SELECT * FROM workspaces WHERE is_active = 1');
    const row = stmt.get();
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      config: JSON.parse(row.config || '{}'),
      isActive: true
    };
  }

  /**
   * Update workspace
   */
  updateWorkspace(id, updates) {
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.config !== undefined) {
      fields.push('config = ?');
      values.push(JSON.stringify(updates.config));
    }
    
    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    const stmt = this.db.prepare(`
      UPDATE workspaces SET ${fields.join(', ')} WHERE id = ?
    `);
    
    stmt.run(...values);
  }

  /**
   * Delete workspace
   */
  deleteWorkspace(id) {
    const stmt = this.db.prepare('DELETE FROM workspaces WHERE id = ?');
    stmt.run(id);
  }

  // ============================================================================
  // Browser Tabs
  // ============================================================================

  /**
   * Save browser tab
   */
  saveBrowserTab(id, url, title, favicon, position) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO browser_tabs (id, url, title, favicon, position, created_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    
    stmt.run(id, url, title, favicon, position, Date.now());
  }

  /**
   * Get all browser tabs
   */
  getAllBrowserTabs() {
    const stmt = this.db.prepare('SELECT * FROM browser_tabs ORDER BY position ASC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      id: row.id,
      url: row.url,
      title: row.title,
      favicon: row.favicon,
      position: row.position,
      createdAt: row.created_at,
      isActive: row.is_active === 1
    }));
  }

  /**
   * Set active browser tab
   */
  setActiveBrowserTab(id) {
    this.db.exec('UPDATE browser_tabs SET is_active = 0');
    const stmt = this.db.prepare('UPDATE browser_tabs SET is_active = 1 WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Delete browser tab
   */
  deleteBrowserTab(id) {
    const stmt = this.db.prepare('DELETE FROM browser_tabs WHERE id = ?');
    stmt.run(id);
  }

  /**
   * Clear all browser tabs
   */
  clearBrowserTabs() {
    this.db.exec('DELETE FROM browser_tabs');
  }

  // ============================================================================
  // MCP Servers
  // ============================================================================

  /**
   * Save MCP server
   */
  saveMCPServer(id, name, command, args, env, status) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO mcp_servers (id, name, command, args, env, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = Date.now();
    stmt.run(id, name, command, JSON.stringify(args), JSON.stringify(env), status, now, now);
  }

  /**
   * Get all MCP servers
   */
  getAllMCPServers() {
    const stmt = this.db.prepare('SELECT * FROM mcp_servers ORDER BY created_at ASC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      command: row.command,
      args: JSON.parse(row.args || '[]'),
      env: JSON.parse(row.env || '{}'),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  /**
   * Update MCP server status
   */
  updateMCPServerStatus(id, status) {
    const stmt = this.db.prepare('UPDATE mcp_servers SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, Date.now(), id);
  }

  /**
   * Delete MCP server
   */
  deleteMCPServer(id) {
    const stmt = this.db.prepare('DELETE FROM mcp_servers WHERE id = ?');
    stmt.run(id);
  }

  // ============================================================================
  // Skills
  // ============================================================================

  /**
   * Save skill
   */
  saveSkill(id, name, version, enabled, config) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO skills (id, name, version, enabled, config, installed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, name, version, enabled ? 1 : 0, JSON.stringify(config), Date.now());
  }

  /**
   * Get all skills
   */
  getAllSkills() {
    const stmt = this.db.prepare('SELECT * FROM skills ORDER BY installed_at ASC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      version: row.version,
      enabled: row.enabled === 1,
      config: JSON.parse(row.config || '{}'),
      installedAt: row.installed_at
    }));
  }

  /**
   * Update skill enabled status
   */
  updateSkillEnabled(id, enabled) {
    const stmt = this.db.prepare('UPDATE skills SET enabled = ? WHERE id = ?');
    stmt.run(enabled ? 1 : 0, id);
  }

  /**
   * Delete skill
   */
  deleteSkill(id) {
    const stmt = this.db.prepare('DELETE FROM skills WHERE id = ?');
    stmt.run(id);
  }

  // ============================================================================
  // Projects
  // ============================================================================

  /**
   * Save project
   */
  saveProject(id, name, path, remoteUrl, syncStatus) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO projects (id, name, path, remote_url, sync_status, last_synced_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const now = Date.now();
    stmt.run(id, name, path, remoteUrl, syncStatus, syncStatus === 'synced' ? now : null, now);
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const rows = stmt.all();
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      path: row.path,
      remoteUrl: row.remote_url,
      syncStatus: row.sync_status,
      lastSyncedAt: row.last_synced_at,
      createdAt: row.created_at
    }));
  }

  /**
   * Update project sync status
   */
  updateProjectSyncStatus(id, syncStatus) {
    const stmt = this.db.prepare(`
      UPDATE projects SET sync_status = ?, last_synced_at = ? WHERE id = ?
    `);
    stmt.run(syncStatus, syncStatus === 'synced' ? Date.now() : null, id);
  }

  /**
   * Delete project
   */
  deleteProject(id) {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get database statistics
   */
  getStats() {
    const stats = {};
    
    const tables = ['conversations', 'messages', 'workspaces', 'browser_tabs', 'mcp_servers', 'skills', 'projects'];
    
    for (const table of tables) {
      const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
      const result = stmt.get();
      stats[table] = result.count;
    }
    
    return stats;
  }

  /**
   * Vacuum database (optimize)
   */
  vacuum() {
    this.db.exec('VACUUM');
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

module.exports = { DatabaseManager };
