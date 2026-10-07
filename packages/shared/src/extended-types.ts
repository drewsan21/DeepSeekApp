// ============================================================================
// DeepSeek Desktop - Extended Shared Types
// ============================================================================
// This file extends the original shared types with:
// - Qwen provider support (account + local Qwen Studio)
// - MCP (Model Context Protocol) server types
// - GitHub integration types
// - Computer Use & Browser Use tool types
// - Skill system types
// ============================================================================

// ============================================================================
// PROVIDER TYPES - Extended
// ============================================================================

export type ProviderType =
  | 'deepseek-api'
  | 'deepseek-account'
  | 'qwen-account'
  | 'qwen-local'
  | 'custom-openai'
  | 'local-model';

export interface ProviderConfig {
  id: string;
  type: ProviderType;
  label: string;
  description: string;
  needsApiKey: boolean;
  needsAccount: boolean;
  isLocal: boolean;
  defaultBaseUrl?: string;
  capabilities: ProviderCapabilities;
}

export interface ProviderCapabilities {
  chat: boolean;
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  computerUse: boolean;
  browserUse: boolean;
  codeExecution: boolean;
  fileAccess: boolean;
}

// ============================================================================
// QWEN PROVIDER TYPES
// ============================================================================

export interface QwenAccountConfig {
  accountId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  token: string;
  expiresAt?: number;
}

export interface QwenLocalConfig {
  modelPath: string;
  modelName: string;
  contextSize: number;
  gpuLayers: number;
  threads: number;
  quantization: 'q4_0' | 'q4_1' | 'q5_0' | 'q5_1' | 'q8_0' | 'f16';
}

export interface QwenStudioConfig {
  installPath: string;
  version: string;
  isRunning: boolean;
  port: number;
  models: QwenLocalModel[];
}

export interface QwenLocalModel {
  id: string;
  name: string;
  path: string;
  size: number;
  quantization: string;
  contextSize: number;
  isLoaded: boolean;
}

// ============================================================================
// MCP (Model Context Protocol) TYPES
// ============================================================================

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  handler: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  description: string;
  required: boolean;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  description?: string;
}

// Default MCP Servers
export type DefaultMCPServer =
  | 'github'
  | 'filesystem'
  | 'git'
  | 'postgres'
  | 'puppeteer'
  | 'brave-search'
  | 'google-maps';

// ============================================================================
// GITHUB INTEGRATION TYPES
// ============================================================================

export interface GitHubConfig {
  token?: string;
  username?: string;
  defaultOwner?: string;
  apiBaseUrl: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description?: string;
  private: boolean;
  defaultBranch: string;
  cloneUrl: string;
  sshUrl: string;
  htmlUrl: string;
  lastPushedAt?: string;
  stars: number;
  forks: number;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  head: string;
  base: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  draft: boolean;
  mergeable: boolean;
}

export interface LocalGitServer {
  id: string;
  name: string;
  path: string;
  port: number;
  isRunning: boolean;
  repositories: LocalGitRepository[];
}

export interface LocalGitRepository {
  id: string;
  name: string;
  path: string;
  branches: string[];
  currentBranch: string;
  lastCommit: string;
  lastCommitDate: string;
  remoteUrl?: string;
  isSynced: boolean;
}

export interface ProjectSyncStatus {
  projectId: string;
  localPath: string;
  remoteUrl?: string;
  lastSyncedAt?: string;
  pendingChanges: number;
  isSyncing: boolean;
  syncError?: string;
}

// ============================================================================
// COMPUTER USE TOOL TYPES
// ============================================================================

export interface ComputerUseAction {
  type: 'click' | 'type' | 'key' | 'scroll' | 'screenshot' | 'move' | 'drag';
  coordinates?: { x: number; y: number };
  text?: string;
  key?: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  scrollDelta?: { x: number; y: number };
  duration?: number;
}

export interface ComputerUseResult {
  success: boolean;
  screenshot?: string; // base64 encoded
  error?: string;
  coordinates?: { x: number; y: number };
}

export interface ScreenInfo {
  width: number;
  height: number;
  scale: number;
  displays: DisplayInfo[];
}

export interface DisplayInfo {
  id: number;
  bounds: { x: number; y: number; width: number; height: number };
  isPrimary: boolean;
  scaleFactor: number;
}

// ============================================================================
// BROWSER USE TOOL TYPES
// ============================================================================

export interface BrowserUseAction {
  type:
    | 'navigate'
    | 'click'
    | 'type'
    | 'select'
    | 'scroll'
    | 'wait'
    | 'screenshot'
    | 'evaluate'
    | 'close';
  url?: string;
  selector?: string;
  text?: string;
  value?: string;
  script?: string;
  timeout?: number;
}

export interface BrowserUseResult {
  success: boolean;
  url?: string;
  title?: string;
  content?: string;
  screenshot?: string;
  error?: string;
}

export interface BrowserSession {
  id: string;
  url: string;
  title: string;
  isHeadless: boolean;
  cookies: BrowserCookie[];
  localStorage: Record<string, string>;
}

export interface BrowserCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  secure: boolean;
  httpOnly: boolean;
}

// ============================================================================
// SKILL SYSTEM TYPES
// ============================================================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: SkillCategory;
  tools: string[]; // tool IDs this skill provides
  dependencies: string[]; // other skill IDs
  isInstalled: boolean;
  isEnabled: boolean;
  config: Record<string, unknown>;
}

export type SkillCategory =
  | 'computer-use'
  | 'browser-use'
  | 'code-analysis'
  | 'file-management'
  | 'data-processing'
  | 'communication'
  | 'integration'
  | 'utility';

export interface SkillInstallationResult {
  success: boolean;
  skill?: Skill;
  error?: string;
  installedDependencies?: string[];
}

// Default installed skills
export const DEFAULT_SKILLS: string[] = [
  'computer-use-basic',
  'computer-use-advanced',
  'browser-use-basic',
  'browser-use-advanced',
  'file-manager',
  'code-analyzer',
  'github-integration',
  'git-operations',
  'mcp-client',
  'screenshot-tool',
  'clipboard-tool',
  'notification-tool',
];

// ============================================================================
// EXTENDED HARNESS TYPES
// ============================================================================

export interface ExtendedHarnessRequest extends HarnessRequest {
  providerId: string;
  model: string;
  prompt: string;
  context?: PageContext;
  tools?: {
    browser?: boolean;
    pageContext?: boolean;
    filesystem?: boolean;
    computerUse?: boolean;
    browserUse?: boolean;
    mcp?: boolean;
    github?: boolean;
  };
  approvalMode?: 'ask' | 'auto-deny' | 'auto-allow-safe';
  mcpServers?: string[]; // MCP server IDs to enable
  skills?: string[]; // skill IDs to enable
}

export type ExtendedHarnessEvent =
  | HarnessEvent
  | { type: 'tool_call'; tool: string; args: unknown }
  | { type: 'tool_result'; tool: string; result: unknown }
  | { type: 'mcp_call'; server: string; tool: string; args: unknown }
  | { type: 'mcp_result'; server: string; tool: string; result: unknown }
  | { type: 'computer_use'; action: ComputerUseAction }
  | { type: 'browser_use'; action: BrowserUseAction }
  | { type: 'github_action'; action: string; payload: unknown }
  | { type: 'sync_status'; project: string; status: ProjectSyncStatus };

// ============================================================================
// EXTENDED API INTERFACE
// ============================================================================

export interface ExtendedDeepSeekDesktopApi extends DeepSeekDesktopApi {
  // Qwen providers
  qwen: {
    login(): Promise<boolean>;
    logout(): Promise<void>;
    status(): Promise<{ authenticated: boolean; account?: QwenAccountConfig }>;
    getLocalModels(): Promise<QwenLocalModel[]>;
    getStudioConfig(): Promise<QwenStudioConfig | null>;
  };

  // MCP servers
  mcp: {
    list(): Promise<MCPServer[]>;
    start(serverId: string): Promise<void>;
    stop(serverId: string): Promise<void>;
    install(serverConfig: Partial<MCPServer>): Promise<MCPServer>;
    uninstall(serverId: string): Promise<void>;
    callTool(serverId: string, toolName: string, args: unknown): Promise<unknown>;
  };

  // GitHub integration
  github: {
    login(): Promise<boolean>;
    logout(): Promise<void>;
    status(): Promise<{ authenticated: boolean; username?: string }>;
    listRepos(): Promise<GitHubRepository[]>;
    getRepo(owner: string, name: string): Promise<GitHubRepository>;
    listIssues(repo: string): Promise<GitHubIssue[]>;
    listPRs(repo: string): Promise<GitHubPullRequest[]>;
  };

  // Local Git Server
  localGit: {
    start(): Promise<void>;
    stop(): Promise<void>;
    status(): Promise<{ running: boolean; port: number }>;
    listRepos(): Promise<LocalGitRepository[]>;
    createRepo(name: string): Promise<LocalGitRepository>;
    syncRepo(repoId: string): Promise<ProjectSyncStatus>;
  };

  // Computer Use
  computerUse: {
    execute(action: ComputerUseAction): Promise<ComputerUseResult>;
    screenshot(): Promise<string>;
    getScreenInfo(): Promise<ScreenInfo>;
  };

  // Browser Use
  browserUse: {
    execute(action: BrowserUseAction): Promise<BrowserUseResult>;
    getSession(): Promise<BrowserSession>;
    getCookies(): Promise<BrowserCookie[]>;
  };

  // Skills
  skills: {
    list(): Promise<Skill[]>;
    install(skillId: string): Promise<SkillInstallationResult>;
    uninstall(skillId: string): Promise<void>;
    enable(skillId: string): Promise<void>;
    disable(skillId: string): Promise<void>;
    getConfig(skillId: string): Promise<Record<string, unknown>>;
    setConfig(skillId: string, config: Record<string, unknown>): Promise<void>;
  };

  // Project Sync
  sync: {
    listProjects(): Promise<ProjectSyncStatus[]>;
    syncProject(projectId: string): Promise<ProjectSyncStatus>;
    syncAll(): Promise<ProjectSyncStatus[]>;
    getSyncStatus(projectId: string): Promise<ProjectSyncStatus>;
  };
}

// ============================================================================
// RE-EXPORT ORIGINAL TYPES
// ============================================================================

// These would normally be imported from the original shared package
// For now, we define minimal versions here

export interface DeepSeekDesktopApi {
  auth: {
    login(): Promise<boolean>;
    logout(): Promise<void>;
    status(): Promise<AuthStatus>;
  };
  providers: {
    list(): Promise<ProviderSummary[]>;
    select(providerId: string): Promise<void>;
    getConfig(): Promise<ProviderPublicConfig[]>;
    configure(request: ProviderConfigureRequest): Promise<boolean>;
  };
  harness: {
    start(request: HarnessRequest): Promise<{ started: boolean }>;
    stop(): Promise<void>;
    onStream(cb: (event: HarnessEvent) => void): () => void;
  };
  browser: {
    open(url: string): Promise<string>;
    newTab(url: string): Promise<string>;
    listTabs(): Promise<BrowserTab[]>;
    getActiveTab(): Promise<string | null>;
    activateTab(tabId: string): Promise<void>;
    closeTab(tabId: string): Promise<void>;
    setBounds(bounds: BrowserBounds): void;
    getPageContext(tabId: string): Promise<PageContext | null>;
    onTabUpdated(cb: (tab: BrowserTab) => void): () => void;
    onTabClosed(cb: (p: { id: string }) => void): () => void;
    onContextAction(cb: (p: BrowserContextActionPayload) => void): () => void;
  };
  approvals: {
    respond(id: string, response: ApprovalResponse): Promise<void>;
  };
  permissions: {
    request(permission: string): Promise<boolean>;
    listSites(): Promise<SitePermission[]>;
    getSite(origin: string): Promise<Permission[]>;
    setSite(origin: string, permissions: Permission[]): Promise<boolean>;
    resetSite(origin: string): Promise<boolean>;
  };
}

export type Permission =
  | 'read_page'
  | 'read_selection'
  | 'navigate'
  | 'click'
  | 'type'
  | 'download'
  | 'upload'
  | 'clipboard_read'
  | 'clipboard_write'
  | 'external_app'
  | 'file_read'
  | 'file_write'
  | 'computer_use'
  | 'browser_use'
  | 'github_access'
  | 'mcp_access';

export interface SitePermission {
  origin: string;
  permissions: Permission[];
  updatedAt: number;
}

export interface PageContext {
  url: string;
  title: string;
  selectedText?: string;
  readableText?: string;
}

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  loading?: boolean;
}

export interface BrowserBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type BrowserContextAction =
  | 'ask'
  | 'summarize'
  | 'explain'
  | 'rewrite'
  | 'translate';

export interface BrowserContextActionPayload {
  action: BrowserContextAction;
  tabId: string;
  url: string;
  title: string;
  selectionText?: string;
}

export interface Account {
  provider: string;
  accountId: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  account?: Account;
  expiresAt?: number;
}

export interface ProviderSummary {
  id: string;
  label: string;
  connected?: boolean;
}

export interface ProviderPublicConfig {
  id: string;
  label: string;
  connected: boolean;
  baseUrl?: string;
  hasApiKey: boolean;
  needsApiKey: boolean;
}

export interface ProviderConfigureRequest {
  id: string;
  baseUrl?: string;
  apiKey?: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  risk: 'normal' | 'danger';
  origin?: string;
  permission?: string;
  details?: Record<string, unknown>;
}

export type ApprovalDecision = 'allow_once' | 'allow_site' | 'deny';

export interface ApprovalResponse {
  decision: ApprovalDecision;
  scope?: 'session' | 'site' | 'workspace';
}

export type HarnessEvent =
  | { type: 'thinking'; data: string }
  | { type: 'message'; data: string }
  | { type: 'tool_call'; tool: string; args: unknown }
  | { type: 'tool_result'; tool: string; result: unknown }
  | { type: 'approval_required'; approval: ApprovalRequest }
  | { type: 'completed' }
  | { type: 'error'; message: string };

export interface HarnessRequest {
  taskId: string;
  providerId: string;
  model: string;
  prompt: string;
  context?: PageContext;
  tools?: {
    browser?: boolean;
    pageContext?: boolean;
    filesystem?: boolean;
  };
  approvalMode?: 'ask' | 'auto-deny';
}
