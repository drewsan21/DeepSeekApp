// ============================================================================
// MCP Server Manager - Manages MCP server lifecycle
// ============================================================================

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type { MCPServer, MCPTool } from '@deepseek/shared';

export class MCPServerManager extends EventEmitter {
  private servers: Map<string, MCPServer> = new Map();
  private processes: Map<string, ChildProcess> = new Map();

  constructor() {
    super();
  }

  // ============================================================================
  // Server Lifecycle
  // ============================================================================

  async install(serverConfig: Partial<MCPServer>): Promise<MCPServer> {
    if (!serverConfig.id || !serverConfig.name || !serverConfig.command) {
      throw new Error('Invalid server configuration: missing required fields');
    }

    const server: MCPServer = {
      id: serverConfig.id,
      name: serverConfig.name,
      description: serverConfig.description || '',
      command: serverConfig.command,
      args: serverConfig.args || [],
      env: serverConfig.env || {},
      status: 'stopped',
      tools: serverConfig.tools || [],
      resources: serverConfig.resources || [],
      prompts: serverConfig.prompts || [],
    };

    this.servers.set(server.id, server);
    this.emit('server-installed', server);

    return server;
  }

  async uninstall(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    // Stop if running
    if (server.status === 'running') {
      await this.stop(serverId);
    }

    this.servers.delete(serverId);
    this.emit('server-uninstalled', serverId);
  }

  async start(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    if (server.status === 'running') {
      return; // Already running
    }

    try {
      // Resolve environment variables
      const env = this.resolveEnvVars(server.env);

      // Spawn the MCP server process
      const proc = spawn(server.command, server.args, {
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.processes.set(serverId, proc);

      // Handle process events
      proc.on('exit', (code) => {
        console.log(`MCP server ${serverId} exited with code ${code}`);
        server.status = 'stopped';
        server.pid = undefined;
        this.processes.delete(serverId);
        this.emit('server-stopped', serverId);
      });

      proc.on('error', (error) => {
        console.error(`MCP server ${serverId} error:`, error);
        server.status = 'error';
        this.emit('server-error', serverId, error);
      });

      // Handle stdout (MCP protocol messages)
      proc.stdout?.on('data', (data) => {
        this.handleServerMessage(serverId, data.toString());
      });

      // Handle stderr (logs/errors)
      proc.stderr?.on('data', (data) => {
        console.error(`[MCP ${serverId}]`, data.toString());
      });

      server.status = 'running';
      server.pid = proc.pid;
      this.emit('server-started', server);
    } catch (error) {
      server.status = 'error';
      this.emit('server-error', serverId, error);
      throw error;
    }
  }

  async stop(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    const proc = this.processes.get(serverId);
    if (proc) {
      proc.kill('SIGTERM');
      
      // Wait for graceful shutdown (with timeout)
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          proc.kill('SIGKILL');
          resolve();
        }, 5000);

        proc.on('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      this.processes.delete(serverId);
    }

    server.status = 'stopped';
    server.pid = undefined;
    this.emit('server-stopped', serverId);
  }

  // ============================================================================
  // Tool Execution
  // ============================================================================

  async callTool(
    serverId: string,
    toolName: string,
    args: unknown
  ): Promise<unknown> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    if (server.status !== 'running') {
      throw new Error(`Server not running: ${serverId}`);
    }

    const tool = server.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName} in server ${serverId}`);
    }

    // Validate arguments against schema
    this.validateToolArgs(tool, args);

    // Send tool call to MCP server via stdin
    const proc = this.processes.get(serverId);
    if (!proc?.stdin) {
      throw new Error(`Server process not available: ${serverId}`);
    }

    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    };

    proc.stdin.write(JSON.stringify(request) + '\n');

    // Wait for response (simplified - in real implementation, use promise-based message handling)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Tool call timeout'));
      }, 30000);

      const handler = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === request.id) {
            clearTimeout(timeout);
            proc.stdout?.off('data', handler);
            
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          // Not a JSON response, ignore
        }
      };

      proc.stdout?.on('data', handler);
    });
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  list(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  get(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId);
  }

  getTools(serverId: string): MCPTool[] {
    const server = this.servers.get(serverId);
    return server?.tools || [];
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private resolveEnvVars(env: Record<string, string>): Record<string, string> {
    const resolved: Record<string, string> = {};

    for (const [key, value] of Object.entries(env)) {
      // Replace ${VAR_NAME} with actual environment variable
      const match = value.match(/\$\{(.+)\}/);
      if (match) {
        const envVar = match[1];
        resolved[key] = process.env[envVar] || '';
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  private validateToolArgs(tool: MCPTool, args: unknown): void {
    // Simplified validation - in real implementation, use JSON Schema validator
    if (!tool.inputSchema) return;

    if (typeof args !== 'object' || args === null) {
      throw new Error('Tool arguments must be an object');
    }

    const required = tool.inputSchema.required || [];
    for (const field of required) {
      if (!(field in (args as Record<string, unknown>))) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private handleServerMessage(serverId: string, message: string): void {
    try {
      const parsed = JSON.parse(message);
      
      // Handle different message types
      if (parsed.method === 'notifications/tools/list_changed') {
        // Server notified that tools list changed
        this.emit('tools-changed', serverId);
      }
      
      // Emit raw message for debugging
      this.emit('server-message', serverId, parsed);
    } catch {
      // Not JSON, might be log output
      console.log(`[MCP ${serverId}]`, message);
    }
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  async shutdown(): Promise<void> {
    const serverIds = Array.from(this.servers.keys());
    await Promise.all(serverIds.map((id) => this.stop(id).catch(() => {})));
  }
}
