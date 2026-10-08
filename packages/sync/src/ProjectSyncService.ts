// ============================================================================
// Project Sync Service - Sync projects between local and remote
// ============================================================================

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { ProjectSyncStatus } from '@deepseek/shared';

const execAsync = promisify(exec);

export class ProjectSyncService extends EventEmitter {
  private projects: Map<string, ProjectSyncStatus> = new Map();
  private syncQueue: Map<string, Promise<void>> = new Map();

  constructor() {
    super();
  }

  // ============================================================================
  // Project Management
  // ============================================================================

  async addProject(projectId: string, localPath: string, remoteUrl?: string): Promise<void> {
    const status: ProjectSyncStatus = {
      projectId,
      localPath,
      remoteUrl,
      pendingChanges: 0,
      isSyncing: false,
    };

    this.projects.set(projectId, status);
    await this.updatePendingChanges(projectId);
    
    this.emit('project-added', status);
  }

  async removeProject(projectId: string): Promise<void> {
    this.projects.delete(projectId);
    this.emit('project-removed', projectId);
  }

  // ============================================================================
  // Sync Operations
  // ============================================================================

  async syncProject(projectId: string): Promise<ProjectSyncStatus> {
    const status = this.projects.get(projectId);
    if (!status) {
      throw new Error(`Project not found: ${projectId}`);
    }

    if (status.isSyncing) {
      throw new Error(`Project already syncing: ${projectId}`);
    }

    // Prevent concurrent syncs
    if (this.syncQueue.has(projectId)) {
      return this.syncQueue.get(projectId)!.then(() => status);
    }

    const syncPromise = this.performSync(projectId);
    this.syncQueue.set(projectId, syncPromise);

    try {
      await syncPromise;
    } finally {
      this.syncQueue.delete(projectId);
    }

    return status;
  }

  async syncAll(): Promise<ProjectSyncStatus[]> {
    const projectIds = Array.from(this.projects.keys());
    const results = await Promise.allSettled(
      projectIds.map((id) => this.syncProject(id))
    );

    return results
      .filter((r): r is PromiseFulfilledResult<ProjectSyncStatus> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  private async performSync(projectId: string): Promise<void> {
    const status = this.projects.get(projectId);
    if (!status) return;

    status.isSyncing = true;
    this.emit('sync-started', status);

    try {
      // Check if there are pending changes
      await this.updatePendingChanges(projectId);

      if (status.pendingChanges > 0) {
        // Commit local changes
        await this.commitChanges(status.localPath, 'Auto-sync commit');
      }

      if (status.remoteUrl) {
        // Pull from remote
        await this.pullFromRemote(status.localPath);

        // Push to remote
        await this.pushToRemote(status.localPath);
      }

      status.lastSyncedAt = new Date().toISOString();
      status.syncError = undefined;
      
      await this.updatePendingChanges(projectId);
      
      this.emit('sync-completed', status);
    } catch (error) {
      status.syncError = error instanceof Error ? error.message : String(error);
      this.emit('sync-error', status, error);
      throw error;
    } finally {
      status.isSyncing = false;
    }
  }

  // ============================================================================
  // Status Queries
  // ============================================================================

  async getSyncStatus(projectId: string): Promise<ProjectSyncStatus> {
    const status = this.projects.get(projectId);
    if (!status) {
      throw new Error(`Project not found: ${projectId}`);
    }

    await this.updatePendingChanges(projectId);
    return status;
  }

  async listProjects(): Promise<ProjectSyncStatus[]> {
    const projects = Array.from(this.projects.values());
    await Promise.all(projects.map((p) => this.updatePendingChanges(p.projectId)));
    return projects;
  }

  // ============================================================================
  // Git Operations
  // ============================================================================

  private async updatePendingChanges(projectId: string): Promise<void> {
    const status = this.projects.get(projectId);
    if (!status) return;

    try {
      const { stdout } = await execAsync('git status --porcelain', {
        cwd: status.localPath,
      });

      status.pendingChanges = stdout.split('\n').filter((line) => line.trim()).length;
    } catch (error) {
      // Not a git repository or git not available
      status.pendingChanges = 0;
    }
  }

  private async commitChanges(localPath: string, message: string): Promise<void> {
    try {
      await execAsync('git add -A', { cwd: localPath });
      await execAsync(`git commit -m "${message}"`, { cwd: localPath });
    } catch (error) {
      // No changes to commit or git error
      console.log('Commit skipped:', error);
    }
  }

  private async pullFromRemote(localPath: string): Promise<void> {
    try {
      await execAsync('git pull --rebase', { cwd: localPath });
    } catch (error) {
      console.error('Pull failed:', error);
      throw new Error('Failed to pull from remote');
    }
  }

  private async pushToRemote(localPath: string): Promise<void> {
    try {
      await execAsync('git push', { cwd: localPath });
    } catch (error) {
      console.error('Push failed:', error);
      throw new Error('Failed to push to remote');
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  async isGitRepository(path: string): Promise<boolean> {
    try {
      await execAsync('git rev-parse --git-dir', { cwd: path });
      return true;
    } catch {
      return false;
    }
  }

  async getGitRemote(path: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync('git remote get-url origin', { cwd: path });
      return stdout.trim();
    } catch {
      return null;
    }
  }

  async getGitBranch(path: string): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: path });
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }
}
