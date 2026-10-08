// ============================================================================
// MCP Server Default Configurations
// ============================================================================

import type { MCPServer } from './extended-types';

// ============================================================================
// DEFAULT MCP SERVER CONFIGURATIONS
// ============================================================================

export const DEFAULT_MCP_SERVERS: Partial<MCPServer>[] = [
  // GitHub MCP Server
  {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub API integration for repositories, issues, PRs',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    env: {
      GITHUB_PERSONAL_ACCESS_TOKEN: '${GITHUB_TOKEN}',
    },
    status: 'stopped',
    tools: [
      {
        name: 'create_issue',
        description: 'Create a new GitHub issue',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            title: { type: 'string', description: 'Issue title' },
            body: { type: 'string', description: 'Issue body' },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Issue labels',
            },
          },
          required: ['owner', 'repo', 'title'],
        },
        handler: 'github:create_issue',
      },
      {
        name: 'list_issues',
        description: 'List issues in a repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            state: {
              type: 'string',
              enum: ['open', 'closed', 'all'],
            },
          },
          required: ['owner', 'repo'],
        },
        handler: 'github:list_issues',
      },
      {
        name: 'create_pull_request',
        description: 'Create a pull request',
        inputSchema: {
          type: 'object',
          properties: {
            owner: { type: 'string' },
            repo: { type: 'string' },
            title: { type: 'string' },
            head: { type: 'string', description: 'Source branch' },
            base: { type: 'string', description: 'Target branch' },
            body: { type: 'string' },
          },
          required: ['owner', 'repo', 'title', 'head', 'base'],
        },
        handler: 'github:create_pull_request',
      },
    ],
    resources: [],
    prompts: [],
  },

  // Filesystem MCP Server
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'File system operations with permission controls',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    env: {
      ALLOWED_PATHS: '${WORKSPACE_PATH}',
    },
    status: 'stopped',
    tools: [
      {
        name: 'read_file',
        description: 'Read a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'File path' },
          },
          required: ['path'],
        },
        handler: 'filesystem:read_file',
      },
      {
        name: 'write_file',
        description: 'Write to a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['path', 'content'],
        },
        handler: 'filesystem:write_file',
      },
      {
        name: 'list_directory',
        description: 'List directory contents',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
          },
          required: ['path'],
        },
        handler: 'filesystem:list_directory',
      },
    ],
    resources: [],
    prompts: [],
  },

  // Git MCP Server
  {
    id: 'git',
    name: 'Git',
    description: 'Git operations for version control',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-git'],
    env: {},
    status: 'stopped',
    tools: [
      {
        name: 'git_status',
        description: 'Get git status',
        inputSchema: {
          type: 'object',
          properties: {
            repoPath: { type: 'string' },
          },
          required: ['repoPath'],
        },
        handler: 'git:status',
      },
      {
        name: 'git_commit',
        description: 'Commit changes',
        inputSchema: {
          type: 'object',
          properties: {
            repoPath: { type: 'string' },
            message: { type: 'string' },
            files: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['repoPath', 'message'],
        },
        handler: 'git:commit',
      },
      {
        name: 'git_push',
        description: 'Push to remote',
        inputSchema: {
          type: 'object',
          properties: {
            repoPath: { type: 'string' },
            remote: { type: 'string', default: 'origin' },
            branch: { type: 'string' },
          },
          required: ['repoPath'],
        },
        handler: 'git:push',
      },
    ],
    resources: [],
    prompts: [],
  },

  // Puppeteer MCP Server (Browser Automation)
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation with Puppeteer',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    env: {},
    status: 'stopped',
    tools: [
      {
        name: 'navigate',
        description: 'Navigate to a URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
          },
          required: ['url'],
        },
        handler: 'puppeteer:navigate',
      },
      {
        name: 'screenshot',
        description: 'Take a screenshot',
        inputSchema: {
          type: 'object',
          properties: {
            selector: { type: 'string' },
            fullPage: { type: 'boolean' },
          },
        },
        handler: 'puppeteer:screenshot',
      },
      {
        name: 'click',
        description: 'Click an element',
        inputSchema: {
          type: 'object',
          properties: {
            selector: { type: 'string' },
          },
          required: ['selector'],
        },
        handler: 'puppeteer:click',
      },
      {
        name: 'fill',
        description: 'Fill an input field',
        inputSchema: {
          type: 'object',
          properties: {
            selector: { type: 'string' },
            value: { type: 'string' },
          },
          required: ['selector', 'value'],
        },
        handler: 'puppeteer:fill',
      },
    ],
    resources: [],
    prompts: [],
  },

  // Brave Search MCP Server
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web search via Brave Search API',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    env: {
      BRAVE_API_KEY: '${BRAVE_API_KEY}',
    },
    status: 'stopped',
    tools: [
      {
        name: 'web_search',
        description: 'Search the web',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            count: { type: 'number', default: 10 },
          },
          required: ['query'],
        },
        handler: 'brave:web_search',
      },
    ],
    resources: [],
    prompts: [],
  },
];

// ============================================================================
// MCP SERVER MANAGER FUNCTIONS
// ============================================================================

export function getDefaultMCPServers(): Partial<MCPServer>[] {
  return DEFAULT_MCP_SERVERS;
}

export function getMCPServerById(
  id: string
): Partial<MCPServer> | undefined {
  return DEFAULT_MCP_SERVERS.find((s) => s.id === id);
}

export function getRequiredEnvVars(serverId: string): string[] {
  const server = getMCPServerById(serverId);
  if (!server?.env) return [];

  const envVars: string[] = [];
  for (const value of Object.values(server.env)) {
    const match = value.match(/\$\{(.+)\}/);
    if (match) {
      envVars.push(match[1]);
    }
  }
  return envVars;
}

export function isMCPServerConfigured(
  serverId: string,
  env: Record<string, string>
): boolean {
  const requiredVars = getRequiredEnvVars(serverId);
  return requiredVars.every((v) => env[v] && env[v].trim() !== '');
}
