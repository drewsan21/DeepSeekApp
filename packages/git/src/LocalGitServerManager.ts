// ============================================================================
// Local Git Server Manager - Gitea integration
// ============================================================================

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type { LocalGitServer, LocalGitRepository } from '@deepseek/shared';

export class LocalGitServerManager extends EventEmitter {
  private server: LocalGitServer | null = null;
  private process: ChildProcess | null = null;
  private giteaPort = 3000;
  private giteaPath: string;

  constructor(userDataPath: string) {
    super();
    this.giteaPath = `${userDataPath}/gitea`;
  }

  // ============================================================================
  // Server Lifecycle
  // ============================================================================

  async start(): Promise<void> {
    if (this.server?.isRunning) {
      return; // Already running
    }

    try {
      // Check if Gitea is installed
      const giteaPath = await this.findGiteaBinary();
      if (!giteaPath) {
        throw new Error('Gitea not found. Please install Gitea first.');
      }

      // Initialize Gitea data directory
      await this.initializeGitea();

      // Start Gitea process
      this.process = spawn(giteaPath, ['web', '--port', this.giteaPort.toString()], {
        cwd: this.giteaPath,
        env: {
          ...process.env,
          GITEA_WORK_DIR: this.giteaPath,
        },
      });

      this.process.on('exit', (code) => {
        console.log(`Gitea exited with code ${code}`);
        if (this.server) {
          this.server.isRunning = false;
        }
        this.process = null;
        this.emit('server-stopped');
      });

      this.process.on('error', (error) => {
        console.error('Gitea error:', error);
        this.emit('server-error', error);
      });

      // Wait for server to be ready
      await this.waitForServer();

      this.server = {
        id: 'local-gitea',
        name: 'Local Gitea',
        path: this.giteaPath,
        port: this.giteaPort,
        isRunning: true,
        repositories: [],
      };

      this.emit('server-started', this.server);
    } catch (error) {
      console.error('Failed to start Gitea:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.process) {
      return;
    }

    this.process.kill('SIGTERM');

    // Wait for graceful shutdown
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        this.process?.kill('SIGKILL');
        resolve();
      }, 5000);

      this.process?.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    if (this.server) {
      this.server.isRunning = false;
    }
    this.process = null;
    this.emit('server-stopped');
  }

  async getStatus(): Promise<{ running: boolean; port: number }> {
    return {
      running: this.server?.isRunning || false,
      port: this.giteaPort,
    };
  }

  // ============================================================================
  // Repository Operations
  // ============================================================================

  async listRepos(): Promise<LocalGitRepository[]> {
    if (!this.server?.isRunning) {
      throw new Error('Local Git server not running');
    }

    // Query Gitea API for repositories
    const response = await fetch(`http://localhost:${this.giteaPort}/api/v1/repos/search`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gitea API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map(this.mapRepository);
  }

  async createRepo(name: string): Promise<LocalGitRepository> {
    if (!this.server?.isRunning) {
      throw new Error('Local Git server not running');
    }

    const response = await fetch(`http://localhost:${this.giteaPort}/api/v1/user/repos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name,
        auto_init: true,
        default_branch: 'main',
      }),
    });

    if (!response.ok) {
      throw new Error(`Gitea API error: ${response.status}`);
    }

    const data = await response.json();
    return this.mapRepository(data);
  }

  async deleteRepo(repoId: string): Promise<void> {
    if (!this.server?.isRunning) {
      throw new Error('Local Git server not running');
    }

    const response = await fetch(
      `http://localhost:${this.giteaPort}/api/v1/repos/${repoId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Gitea API error: ${response.status}`);
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private async findGiteaBinary(): Promise<string | null> {
    // Common Gitea binary locations
    const paths = [
      '/usr/local/bin/gitea',
      '/usr/bin/gitea',
      `${process.env.HOME}/.local/bin/gitea`,
      'C:\\Program Files\\Gitea\\gitea.exe',
    ];

    // In a real implementation, we'd check if these files exist
    // For now, return a mock path
    return paths[0];
  }

  private async initializeGitea(): Promise<void> {
    // Create Gitea data directory
    const fs = await import('fs/promises');
    await fs.mkdir(this.giteaPath, { recursive: true });

    // Create minimal Gitea config
    const config = `
[server]
DOMAIN = localhost
HTTP_PORT = ${this.giteaPort}
ROOT_URL = http://localhost:${this.giteaPort}/

[database]
DB_TYPE = sqlite3
PATH = ${this.giteaPath}/gitea.db

[repository]
ROOT = ${this.giteaPath}/repos

[security]
INSTALL_LOCK = true
SECRET_KEY = auto-generated
`;

    await fs.mkdir(`${this.giteaPath}/custom/conf`, { recursive: true });
    await fs.writeFile(`${this.giteaPath}/custom/conf/app.ini`, config);
  }

  private async waitForServer(): Promise<void> {
    const maxAttempts = 30;
    const delay = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://localhost:${this.giteaPort}/api/v1/version`);
        if (response.ok) {
          return;
        }
      } catch {
        // Server not ready yet
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('Gitea server failed to start');
  }

  private mapRepository(data: any): LocalGitRepository {
    return {
      id: data.id.toString(),
      name: data.name,
      path: data.full_name,
      branches: ['main'], // Would need to query branches separately
      currentBranch: 'main',
      lastCommit: data.updated_at,
      lastCommitDate: data.updated_at,
      remoteUrl: data.clone_url,
      isSynced: true,
    };
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  async shutdown(): Promise<void> {
    await this.stop();
  }
}
