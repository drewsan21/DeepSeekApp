// ============================================================================
// Git Tools - Version control operations
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import type { Tool } from '../ToolRegistry';

const execAsync = promisify(exec);

async function gitStatusHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.' } = args as { repoPath?: string };

  try {
    const { stdout } = await execAsync('git status --porcelain', { cwd: repoPath });
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
    
    const changes = stdout.split('\n').filter(line => line.trim()).map(line => ({
      status: line.substring(0, 2).trim(),
      file: line.substring(3),
    }));

    return {
      success: true,
      branch: branch.trim(),
      changes,
      isClean: changes.length === 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function gitAddHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.', files = ['.'] } = args as {
    repoPath?: string;
    files?: string[];
  };

  try {
    const fileList = files.join(' ');
    await execAsync(`git add ${fileList}`, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function gitCommitHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.', message, files } = args as {
    repoPath?: string;
    message: string;
    files?: string[];
  };

  try {
    // Add files if specified
    if (files && files.length > 0) {
      const fileList = files.join(' ');
      await execAsync(`git add ${fileList}`, { cwd: repoPath });
    }

    // Commit
    const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: repoPath });
    
    // Get commit hash
    const { stdout: hash } = await execAsync('git rev-parse HEAD', { cwd: repoPath });
    
    return {
      success: true,
      commitHash: hash.trim(),
      output: stdout.trim(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function gitPushHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.', remote = 'origin', branch } = args as {
    repoPath?: string;
    remote?: string;
    branch?: string;
  };

  try {
    let command = `git push ${remote}`;
    if (branch) {
      command += ` ${branch}`;
    }
    
    const { stdout } = await execAsync(command, { cwd: repoPath });
    return { success: true, output: stdout.trim() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function gitPullHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.', remote = 'origin', branch, rebase = false } = args as {
    repoPath?: string;
    remote?: string;
    branch?: string;
    rebase?: boolean;
  };

  try {
    let command = `git pull`;
    if (rebase) {
      command += ' --rebase';
    }
    command += ` ${remote}`;
    if (branch) {
      command += ` ${branch}`;
    }
    
    const { stdout } = await execAsync(command, { cwd: repoPath });
    return { success: true, output: stdout.trim() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function gitBranchHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.', action = 'list', name, base } = args as {
    repoPath?: string;
    action?: 'list' | 'create' | 'delete' | 'switch';
    name?: string;
    base?: string;
  };

  try {
    let command: string;
    
    switch (action) {
      case 'list':
        command = 'git branch -a';
        break;
      case 'create':
        if (!name) throw new Error('Branch name required for create action');
        command = base ? `git branch ${name} ${base}` : `git branch ${name}`;
        break;
      case 'delete':
        if (!name) throw new Error('Branch name required for delete action');
        command = `git branch -d ${name}`;
        break;
      case 'switch':
        if (!name) throw new Error('Branch name required for switch action');
        command = `git checkout ${name}`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const { stdout } = await execAsync(command, { cwd: repoPath });
    return { success: true, output: stdout.trim() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function gitLogHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.', count = 10 } = args as {
    repoPath?: string;
    count?: number;
  };

  try {
    const { stdout } = await execAsync(
      `git log --oneline -n ${count}`,
      { cwd: repoPath }
    );
    
    const commits = stdout.trim().split('\n').map(line => {
      const [hash, ...messageParts] = line.split(' ');
      return {
        hash,
        message: messageParts.join(' '),
      };
    });

    return { success: true, commits };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function gitDiffHandler(args: unknown): Promise<unknown> {
  const { repoPath = '.', staged = false } = args as {
    repoPath?: string;
    staged?: boolean;
  };

  try {
    const command = staged ? 'git diff --cached' : 'git diff';
    const { stdout } = await execAsync(command, { cwd: repoPath });
    return { success: true, diff: stdout };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// Tool Definitions
// ============================================================================

export const gitTools: Tool[] = [
  {
    id: 'git.status',
    name: 'git_status',
    description: 'Get git repository status',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
      },
    },
    handler: gitStatusHandler,
    requiresApproval: false,
    isEnabled: true,
  },
  {
    id: 'git.add',
    name: 'git_add',
    description: 'Add files to staging area',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files to add',
        },
      },
    },
    handler: gitAddHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'git.commit',
    name: 'git_commit',
    description: 'Commit changes',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
        message: { type: 'string', description: 'Commit message' },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'Files to commit',
        },
      },
      required: ['message'],
    },
    handler: gitCommitHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'git.push',
    name: 'git_push',
    description: 'Push commits to remote',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
        remote: { type: 'string', description: 'Remote name' },
        branch: { type: 'string', description: 'Branch name' },
      },
    },
    handler: gitPushHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'git.pull',
    name: 'git_pull',
    description: 'Pull changes from remote',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
        remote: { type: 'string', description: 'Remote name' },
        branch: { type: 'string', description: 'Branch name' },
        rebase: { type: 'boolean', description: 'Use rebase instead of merge' },
      },
    },
    handler: gitPullHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'git.branch',
    name: 'git_branch',
    description: 'Manage git branches',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
        action: {
          type: 'string',
          enum: ['list', 'create', 'delete', 'switch'],
          description: 'Branch action',
        },
        name: { type: 'string', description: 'Branch name' },
        base: { type: 'string', description: 'Base branch for create' },
      },
    },
    handler: gitBranchHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'git.log',
    name: 'git_log',
    description: 'View commit history',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
        count: { type: 'number', description: 'Number of commits' },
      },
    },
    handler: gitLogHandler,
    requiresApproval: false,
    isEnabled: true,
  },
  {
    id: 'git.diff',
    name: 'git_diff',
    description: 'View changes',
    category: 'git',
    inputSchema: {
      type: 'object',
      properties: {
        repoPath: { type: 'string', description: 'Repository path' },
        staged: { type: 'boolean', description: 'Show staged changes' },
      },
    },
    handler: gitDiffHandler,
    requiresApproval: false,
    isEnabled: true,
  },
];
