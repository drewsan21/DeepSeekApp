// ============================================================================
// MCP Server Manager Tests
// ============================================================================

import { MCPServerManager } from '../src/MCPServerManager';
import type { MCPServer } from '@deepseek/shared';

describe('MCPServerManager', () => {
  let manager: MCPServerManager;

  beforeEach(() => {
    manager = new MCPServerManager();
  });

  afterEach(async () => {
    await manager.shutdown();
  });

  describe('install', () => {
    it('should install a new MCP server', async () => {
      const serverConfig: Partial<MCPServer> = {
        id: 'test-server',
        name: 'Test Server',
        description: 'A test server',
        command: 'node',
        args: ['test.js'],
        env: {},
        tools: [],
        resources: [],
        prompts: [],
      };

      const server = await manager.install(serverConfig);
      expect(server).toBeDefined();
      expect(server.id).toBe('test-server');
      expect(server.status).toBe('stopped');
    });

    it('should throw error for invalid server config', async () => {
      await expect(manager.install({})).rejects.toThrow('Invalid server configuration');
    });
  });

  describe('uninstall', () => {
    it('should uninstall an MCP server', async () => {
      const serverConfig: Partial<MCPServer> = {
        id: 'test-server',
        name: 'Test Server',
        command: 'node',
        args: [],
        env: {},
        tools: [],
        resources: [],
        prompts: [],
      };

      await manager.install(serverConfig);
      await manager.uninstall('test-server');

      const server = manager.get('test-server');
      expect(server).toBeUndefined();
    });

    it('should throw error for non-existent server', async () => {
      await expect(manager.uninstall('non-existent')).rejects.toThrow('Server not found');
    });
  });

  describe('list', () => {
    it('should list all servers', async () => {
      const server1: Partial<MCPServer> = {
        id: 'server1',
        name: 'Server 1',
        command: 'node',
        args: [],
        env: {},
        tools: [],
        resources: [],
        prompts: [],
      };

      const server2: Partial<MCPServer> = {
        id: 'server2',
        name: 'Server 2',
        command: 'node',
        args: [],
        env: {},
        tools: [],
        resources: [],
        prompts: [],
      };

      await manager.install(server1);
      await manager.install(server2);

      const servers = manager.list();
      expect(servers.length).toBe(2);
    });
  });

  describe('get', () => {
    it('should get server by id', async () => {
      const serverConfig: Partial<MCPServer> = {
        id: 'test-server',
        name: 'Test Server',
        command: 'node',
        args: [],
        env: {},
        tools: [],
        resources: [],
        prompts: [],
      };

      await manager.install(serverConfig);
      const server = manager.get('test-server');
      expect(server).toBeDefined();
      expect(server?.id).toBe('test-server');
    });

    it('should return undefined for non-existent server', () => {
      const server = manager.get('non-existent');
      expect(server).toBeUndefined();
    });
  });

  describe('getTools', () => {
    it('should get tools for a server', async () => {
      const serverConfig: Partial<MCPServer> = {
        id: 'test-server',
        name: 'Test Server',
        command: 'node',
        args: [],
        env: {},
        tools: [
          {
            name: 'test-tool',
            description: 'A test tool',
            inputSchema: { type: 'object' },
            handler: 'test:handler',
          },
        ],
        resources: [],
        prompts: [],
      };

      await manager.install(serverConfig);
      const tools = manager.getTools('test-server');
      expect(tools.length).toBe(1);
      expect(tools[0].name).toBe('test-tool');
    });
  });
});
