// ============================================================================
// File System Tools - File operations with permission controls
// ============================================================================

import * as fs from 'fs/promises';
import * as path from 'path';
import type { Tool } from '../ToolRegistry';

async function readFileHandler(args: unknown): Promise<unknown> {
  const { path: filePath, encoding = 'utf-8' } = args as {
    path: string;
    encoding?: BufferEncoding;
  };

  try {
    const content = await fs.readFile(filePath, encoding);
    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function writeFileHandler(args: unknown): Promise<unknown> {
  const { path: filePath, content, encoding = 'utf-8' } = args as {
    path: string;
    content: string;
    encoding?: BufferEncoding;
  };

  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, encoding);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function listDirectoryHandler(args: unknown): Promise<unknown> {
  const { path: dirPath, recursive = false } = args as {
    path: string;
    recursive?: boolean;
  };

  try {
    if (recursive) {
      const files: string[] = [];
      async function walk(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          files.push(fullPath);
          if (entry.isDirectory()) {
            await walk(fullPath);
          }
        }
      }
      await walk(dirPath);
      return { success: true, files };
    } else {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: path.join(dirPath, entry.name),
      }));
      return { success: true, files };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function deleteFileHandler(args: unknown): Promise<unknown> {
  const { path: filePath, recursive = false } = args as {
    path: string;
    recursive?: boolean;
  };

  try {
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      if (recursive) {
        await fs.rm(filePath, { recursive: true, force: true });
      } else {
        await fs.rmdir(filePath);
      }
    } else {
      await fs.unlink(filePath);
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function copyFileHandler(args: unknown): Promise<unknown> {
  const { source, destination } = args as {
    source: string;
    destination: string;
  };

  try {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(source, destination);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function moveFileHandler(args: unknown): Promise<unknown> {
  const { source, destination } = args as {
    source: string;
    destination: string;
  };

  try {
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.rename(source, destination);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function getFileStatsHandler(args: unknown): Promise<unknown> {
  const { path: filePath } = args as { path: string };

  try {
    const stat = await fs.stat(filePath);
    return {
      success: true,
      stats: {
        size: stat.size,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory(),
        created: stat.birthtime.toISOString(),
        modified: stat.mtime.toISOString(),
        accessed: stat.atime.toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function createDirectoryHandler(args: unknown): Promise<unknown> {
  const { path: dirPath, recursive = true } = args as {
    path: string;
    recursive?: boolean;
  };

  try {
    await fs.mkdir(dirPath, { recursive });
    return { success: true };
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

export const fileSystemTools: Tool[] = [
  {
    id: 'filesystem.read',
    name: 'read_file',
    description: 'Read contents of a file',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        encoding: { type: 'string', description: 'File encoding' },
      },
      required: ['path'],
    },
    handler: readFileHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'filesystem.write',
    name: 'write_file',
    description: 'Write content to a file',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        content: { type: 'string', description: 'Content to write' },
        encoding: { type: 'string', description: 'File encoding' },
      },
      required: ['path', 'content'],
    },
    handler: writeFileHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'filesystem.list',
    name: 'list_directory',
    description: 'List contents of a directory',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path' },
        recursive: { type: 'boolean', description: 'List recursively' },
      },
      required: ['path'],
    },
    handler: listDirectoryHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'filesystem.delete',
    name: 'delete_file',
    description: 'Delete a file or directory',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File or directory path' },
        recursive: { type: 'boolean', description: 'Delete recursively' },
      },
      required: ['path'],
    },
    handler: deleteFileHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'filesystem.copy',
    name: 'copy_file',
    description: 'Copy a file',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Source path' },
        destination: { type: 'string', description: 'Destination path' },
      },
      required: ['source', 'destination'],
    },
    handler: copyFileHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'filesystem.move',
    name: 'move_file',
    description: 'Move or rename a file',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        source: { type: 'string', description: 'Source path' },
        destination: { type: 'string', description: 'Destination path' },
      },
      required: ['source', 'destination'],
    },
    handler: moveFileHandler,
    requiresApproval: true,
    isEnabled: true,
  },
  {
    id: 'filesystem.stats',
    name: 'get_file_stats',
    description: 'Get file or directory statistics',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File or directory path' },
      },
      required: ['path'],
    },
    handler: getFileStatsHandler,
    requiresApproval: false,
    isEnabled: true,
  },
  {
    id: 'filesystem.mkdir',
    name: 'create_directory',
    description: 'Create a directory',
    category: 'file-system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path' },
        recursive: { type: 'boolean', description: 'Create parent directories' },
      },
      required: ['path'],
    },
    handler: createDirectoryHandler,
    requiresApproval: true,
    isEnabled: true,
  },
];
