// ============================================================================
// Tool Implementations - Index
// ============================================================================
// This file exports all tool implementations and provides a registration function
// ============================================================================

import { ToolRegistry } from '../ToolRegistry';
import { computerUseTools } from './ComputerUseTools';
import { browserUseTools } from './BrowserUseTools';
import { fileSystemTools } from './FileSystemTools';
import { gitTools } from './GitTools';
import { githubTools } from './GitHubTools';
import { mcpTools } from './MCPTools';
import { utilityTools } from './UtilityTools';

// Re-export all tool arrays
export { computerUseTools } from './ComputerUseTools';
export { browserUseTools } from './BrowserUseTools';
export { fileSystemTools } from './FileSystemTools';
export { gitTools } from './GitTools';
export { githubTools } from './GitHubTools';
export { mcpTools } from './MCPTools';
export { utilityTools } from './UtilityTools';

// ============================================================================
// Tool Registration
// ============================================================================

/**
 * Register all default tools with the provided registry
 */
export function registerAllTools(registry: ToolRegistry): void {
  // Computer Use Tools
  registry.registerMany(computerUseTools);
  
  // Browser Use Tools
  registry.registerMany(browserUseTools);
  
  // File System Tools
  registry.registerMany(fileSystemTools);
  
  // Git Tools
  registry.registerMany(gitTools);
  
  // GitHub Tools
  registry.registerMany(githubTools);
  
  // MCP Tools
  registry.registerMany(mcpTools);
  
  // Utility Tools
  registry.registerMany(utilityTools);
}

/**
 * Get all default tools
 */
export function getAllTools() {
  return [
    ...computerUseTools,
    ...browserUseTools,
    ...fileSystemTools,
    ...gitTools,
    ...githubTools,
    ...mcpTools,
    ...utilityTools,
  ];
}

/**
 * Get tool count by category
 */
export function getToolCountByCategory(): Record<string, number> {
  const tools = getAllTools();
  const counts: Record<string, number> = {};
  
  for (const tool of tools) {
    counts[tool.category] = (counts[tool.category] || 0) + 1;
  }
  
  return counts;
}

/**
 * Get total tool count
 */
export function getTotalToolCount(): number {
  return getAllTools().length;
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  registerAllTools,
  getAllTools,
  getToolCountByCategory,
  getTotalToolCount,
};
