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
  | 'file_write';

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

export type ApprovalDecision =
  | 'allow_once'
  | 'allow_site'
  | 'deny';

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

export interface Harness {
  start(): Promise<void>;
  stop(): Promise<void>;
  status(): Promise<'running' | 'stopped' | 'error'>;
  stream(request: HarnessRequest): Promise<AsyncIterable<HarnessEvent>>;
  respondApproval?(id: string, response: ApprovalResponse): Promise<void>;
}

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
