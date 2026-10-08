// ============================================================================
// Tool Registry Tests
// ============================================================================

import { ToolRegistry } from '../src/ToolRegistry';
import type { Tool } from '../src/ToolRegistry';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  describe('register', () => {
    it('should register a new tool', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool);
      const registered = registry.get('test-tool');
      expect(registered).toBeDefined();
      expect(registered?.id).toBe('test-tool');
    });

    it('should throw error for duplicate tool', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool);
      expect(() => registry.register(tool)).toThrow('Tool already registered');
    });
  });

  describe('unregister', () => {
    it('should unregister a tool', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool);
      registry.unregister('test-tool');
      const registered = registry.get('test-tool');
      expect(registered).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get tool by id', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool);
      const registered = registry.get('test-tool');
      expect(registered).toBeDefined();
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.get('non-existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all tools', () => {
      const tool1: Tool = {
        id: 'tool1',
        name: 'Tool 1',
        description: 'Tool 1',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      const tool2: Tool = {
        id: 'tool2',
        name: 'Tool 2',
        description: 'Tool 2',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool1);
      registry.register(tool2);

      const tools = registry.getAll();
      expect(tools.length).toBe(2);
    });
  });

  describe('getByCategory', () => {
    it('should filter tools by category', () => {
      const tool1: Tool = {
        id: 'tool1',
        name: 'Tool 1',
        description: 'Tool 1',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      const tool2: Tool = {
        id: 'tool2',
        name: 'Tool 2',
        description: 'Tool 2',
        category: 'git',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool1);
      registry.register(tool2);

      const tools = registry.getByCategory('utility');
      expect(tools.length).toBe(1);
      expect(tools[0].category).toBe('utility');
    });
  });

  describe('getEnabled', () => {
    it('should return only enabled tools', () => {
      const tool1: Tool = {
        id: 'tool1',
        name: 'Tool 1',
        description: 'Tool 1',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      const tool2: Tool = {
        id: 'tool2',
        name: 'Tool 2',
        description: 'Tool 2',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: false,
      };

      registry.register(tool1);
      registry.register(tool2);

      const tools = registry.getEnabled();
      expect(tools.length).toBe(1);
      expect(tools[0].isEnabled).toBe(true);
    });
  });

  describe('execute', () => {
    it('should execute a tool', async () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            value: { type: 'string' },
          },
          required: ['value'],
        },
        handler: async (args) => ({ success: true, value: (args as any).value }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool);
      const result = await registry.execute('test-tool', { value: 'test' });
      expect(result).toEqual({ success: true, value: 'test' });
    });

    it('should throw error for non-existent tool', async () => {
      await expect(registry.execute('non-existent', {})).rejects.toThrow('Tool not found');
    });

    it('should throw error for disabled tool', async () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: false,
      };

      registry.register(tool);
      await expect(registry.execute('test-tool', {})).rejects.toThrow('Tool is disabled');
    });
  });

  describe('enable/disable', () => {
    it('should enable a tool', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: false,
      };

      registry.register(tool);
      registry.enable('test-tool');
      const registered = registry.get('test-tool');
      expect(registered?.isEnabled).toBe(true);
    });

    it('should disable a tool', () => {
      const tool: Tool = {
        id: 'test-tool',
        name: 'Test Tool',
        description: 'A test tool',
        category: 'utility',
        inputSchema: { type: 'object' },
        handler: async () => ({ success: true }),
        requiresApproval: false,
        isEnabled: true,
      };

      registry.register(tool);
      registry.disable('test-tool');
      const registered = registry.get('test-tool');
      expect(registered?.isEnabled).toBe(false);
    });
  });
});
