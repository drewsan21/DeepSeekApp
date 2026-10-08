// ============================================================================
// Tool Registry - Central registry for all tools
// ============================================================================

import type { JSONSchema } from '@deepseek/shared';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  inputSchema: JSONSchema;
  handler: ToolHandler;
  requiresApproval: boolean;
  isEnabled: boolean;
}

export type ToolCategory =
  | 'computer-use'
  | 'browser-use'
  | 'file-system'
  | 'git'
  | 'github'
  | 'mcp'
  | 'utility';

export type ToolHandler = (args: unknown) => Promise<unknown>;

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {}

  // ============================================================================
  // Tool Registration
  // ============================================================================

  register(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool already registered: ${tool.id}`);
    }

    this.tools.set(tool.id, tool);
  }

  unregister(toolId: string): void {
    this.tools.delete(toolId);
  }

  // ============================================================================
  // Tool Queries
  // ============================================================================

  get(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: ToolCategory): Tool[] {
    return Array.from(this.tools.values()).filter((t) => t.category === category);
  }

  getEnabled(): Tool[] {
    return Array.from(this.tools.values()).filter((t) => t.isEnabled);
  }

  getByName(name: string): Tool | undefined {
    return Array.from(this.tools.values()).find((t) => t.name === name);
  }

  // ============================================================================
  // Tool Execution
  // ============================================================================

  async execute(toolId: string, args: unknown): Promise<unknown> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    if (!tool.isEnabled) {
      throw new Error(`Tool is disabled: ${toolId}`);
    }

    // Validate arguments
    this.validateArgs(tool, args);

    // Execute tool handler
    return await tool.handler(args);
  }

  // ============================================================================
  // Tool Management
  // ============================================================================

  enable(toolId: string): void {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    tool.isEnabled = true;
  }

  disable(toolId: string): void {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    tool.isEnabled = false;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private validateArgs(tool: Tool, args: unknown): void {
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

    // Additional validation based on schema types
    const properties = tool.inputSchema.properties || {};
    for (const [key, schema] of Object.entries(properties)) {
      const value = (args as Record<string, unknown>)[key];
      
      if (value !== undefined) {
        this.validateValue(key, value, schema);
      }
    }
  }

  private validateValue(key: string, value: unknown, schema: JSONSchema): void {
    const expectedType = schema.type;

    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`Field ${key} must be a string`);
        }
        break;
      case 'number':
        if (typeof value !== 'number') {
          throw new Error(`Field ${key} must be a number`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`Field ${key} must be a boolean`);
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Field ${key} must be an array`);
        }
        break;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new Error(`Field ${key} must be an object`);
        }
        break;
    }
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  registerMany(tools: Tool[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  enableAll(): void {
    for (const tool of this.tools.values()) {
      tool.isEnabled = true;
    }
  }

  disableAll(): void {
    for (const tool of this.tools.values()) {
      tool.isEnabled = false;
    }
  }

  clear(): void {
    this.tools.clear();
  }
}
