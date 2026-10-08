// ============================================================================
// Skill System - Default Skills and Skill Registry
// ============================================================================

import type { Skill, SkillCategory } from './extended-types';

// ============================================================================
// DEFAULT SKILLS - Installed by default
// ============================================================================

export const DEFAULT_SKILLS: Skill[] = [
  // Computer Use Skills
  {
    id: 'computer-use-basic',
    name: 'Computer Use - Basic',
    description: 'Basic desktop automation: click, type, key press',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'computer-use',
    tools: ['click', 'type', 'key_press', 'screenshot'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {},
  },
  {
    id: 'computer-use-advanced',
    name: 'Computer Use - Advanced',
    description: 'Advanced desktop automation: drag, scroll, window management',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'computer-use',
    tools: ['drag', 'scroll', 'move_mouse', 'window_control'],
    dependencies: ['computer-use-basic'],
    isInstalled: true,
    isEnabled: true,
    config: {},
  },

  // Browser Use Skills
  {
    id: 'browser-use-basic',
    name: 'Browser Use - Basic',
    description: 'Basic browser automation: navigate, click, fill forms',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'browser-use',
    tools: ['navigate', 'click_element', 'fill_input', 'screenshot_page'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {},
  },
  {
    id: 'browser-use-advanced',
    name: 'Browser Use - Advanced',
    description: 'Advanced browser automation: scraping, waiting, evaluation',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'browser-use',
    tools: ['scrape_content', 'wait_for', 'evaluate_js', 'extract_data'],
    dependencies: ['browser-use-basic'],
    isInstalled: true,
    isEnabled: true,
    config: {},
  },

  // File Management Skills
  {
    id: 'file-manager',
    name: 'File Manager',
    description: 'File system operations with permission controls',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'file-management',
    tools: ['read_file', 'write_file', 'list_directory', 'delete_file'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      allowedPaths: [],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
  },

  // Code Analysis Skills
  {
    id: 'code-analyzer',
    name: 'Code Analyzer',
    description: 'Static code analysis and linting',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'code-analysis',
    tools: ['analyze_code', 'find_issues', 'suggest_fixes'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      languages: ['typescript', 'javascript', 'python', 'rust'],
    },
  },

  // Integration Skills
  {
    id: 'github-integration',
    name: 'GitHub Integration',
    description: 'GitHub API integration for repos, issues, PRs',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'integration',
    tools: [
      'list_repos',
      'create_issue',
      'create_pr',
      'merge_pr',
      'review_code',
    ],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      defaultOwner: '',
      autoSync: false,
    },
  },
  {
    id: 'git-operations',
    name: 'Git Operations',
    description: 'Git version control operations',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'integration',
    tools: [
      'git_status',
      'git_add',
      'git_commit',
      'git_push',
      'git_pull',
      'git_branch',
    ],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      autoCommit: false,
      commitMessageTemplate: '{type}: {message}',
    },
  },

  // MCP Client Skill
  {
    id: 'mcp-client',
    name: 'MCP Client',
    description: 'Model Context Protocol client for tool orchestration',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'utility',
    tools: ['mcp_call', 'mcp_list_tools', 'mcp_list_resources'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      defaultServers: ['github', 'filesystem', 'git'],
    },
  },

  // Utility Skills
  {
    id: 'screenshot-tool',
    name: 'Screenshot Tool',
    description: 'Capture screenshots of screen or windows',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'utility',
    tools: ['screenshot_screen', 'screenshot_window', 'screenshot_region'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      format: 'png',
      quality: 90,
    },
  },
  {
    id: 'clipboard-tool',
    name: 'Clipboard Tool',
    description: 'Read and write to system clipboard',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'utility',
    tools: ['clipboard_read', 'clipboard_write'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      requireApproval: true,
    },
  },
  {
    id: 'notification-tool',
    name: 'Notification Tool',
    description: 'Send system notifications',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'utility',
    tools: ['send_notification', 'show_alert'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    config: {
      sound: true,
      duration: 5000,
    },
  },
];

// ============================================================================
// AVAILABLE SKILLS - Can be installed
// ============================================================================

export const AVAILABLE_SKILLS: Skill[] = [
  // Additional Computer Use Skills
  {
    id: 'computer-use-ocr',
    name: 'Computer Use - OCR',
    description: 'Optical character recognition for screen text',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'computer-use',
    tools: ['ocr_screen', 'ocr_region', 'find_text_on_screen'],
    dependencies: ['computer-use-basic'],
    isInstalled: false,
    isEnabled: false,
    config: {},
  },

  // Additional Browser Use Skills
  {
    id: 'browser-use-pdf',
    name: 'Browser Use - PDF',
    description: 'PDF generation and manipulation',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'browser-use',
    tools: ['generate_pdf', 'extract_pdf_text', 'fill_pdf_form'],
    dependencies: ['browser-use-basic'],
    isInstalled: false,
    isEnabled: false,
    config: {},
  },

  // Data Processing Skills
  {
    id: 'csv-processor',
    name: 'CSV Processor',
    description: 'CSV file parsing and manipulation',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'data-processing',
    tools: ['parse_csv', 'transform_csv', 'export_csv'],
    dependencies: ['file-manager'],
    isInstalled: false,
    isEnabled: false,
    config: {},
  },
  {
    id: 'json-processor',
    name: 'JSON Processor',
    description: 'JSON file parsing and manipulation',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'data-processing',
    tools: ['parse_json', 'transform_json', 'validate_json'],
    dependencies: ['file-manager'],
    isInstalled: false,
    isEnabled: false,
    config: {},
  },

  // Communication Skills
  {
    id: 'email-sender',
    name: 'Email Sender',
    description: 'Send emails via SMTP',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'communication',
    tools: ['send_email', 'send_email_with_attachment'],
    dependencies: [],
    isInstalled: false,
    isEnabled: false,
    config: {
      smtpHost: '',
      smtpPort: 587,
      requireAuth: true,
    },
  },
  {
    id: 'slack-integration',
    name: 'Slack Integration',
    description: 'Send messages to Slack channels',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'communication',
    tools: ['send_slack_message', 'list_slack_channels'],
    dependencies: [],
    isInstalled: false,
    isEnabled: false,
    config: {
      webhookUrl: '',
    },
  },

  // Additional Integration Skills
  {
    id: 'docker-integration',
    name: 'Docker Integration',
    description: 'Docker container management',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'integration',
    tools: [
      'list_containers',
      'start_container',
      'stop_container',
      'exec_in_container',
    ],
    dependencies: [],
    isInstalled: false,
    isEnabled: false,
    config: {},
  },
  {
    id: 'database-integration',
    name: 'Database Integration',
    description: 'Database query and management',
    version: '1.0.0',
    author: 'DeepSeek',
    category: 'integration',
    tools: ['query_database', 'list_tables', 'describe_table'],
    dependencies: [],
    isInstalled: false,
    isEnabled: false,
    config: {
      connectionString: '',
    },
  },
];

// ============================================================================
// SKILL REGISTRY FUNCTIONS
// ============================================================================

export function getDefaultSkills(): Skill[] {
  return DEFAULT_SKILLS;
}

export function getAvailableSkills(): Skill[] {
  return AVAILABLE_SKILLS;
}

export function getAllSkills(): Skill[] {
  return [...DEFAULT_SKILLS, ...AVAILABLE_SKILLS];
}

export function getSkillById(id: string): Skill | undefined {
  return getAllSkills().find((s) => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return getAllSkills().filter((s) => s.category === category);
}

export function getInstalledSkills(): Skill[] {
  return getAllSkills().filter((s) => s.isInstalled);
}

export function getEnabledSkills(): Skill[] {
  return getAllSkills().filter((s) => s.isEnabled);
}

export function getSkillDependencies(skillId: string): string[] {
  const skill = getSkillById(skillId);
  return skill?.dependencies || [];
}

export function getSkillTools(skillId: string): string[] {
  const skill = getSkillById(skillId);
  return skill?.tools || [];
}

export function canInstallSkill(
  skillId: string,
  installedSkills: string[]
): boolean {
  const skill = getSkillById(skillId);
  if (!skill) return false;

  // Check if already installed
  if (skill.isInstalled) return false;

  // Check dependencies
  return skill.dependencies.every((dep) => installedSkills.includes(dep));
}
