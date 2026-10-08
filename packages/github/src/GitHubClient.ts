// ============================================================================
// GitHub API Client - Full GitHub integration
// ============================================================================

import type {
  GitHubConfig,
  GitHubRepository,
  GitHubIssue,
  GitHubPullRequest,
} from '@deepseek/shared';

export class GitHubClient {
  private config: GitHubConfig | null = null;
  private baseUrl = 'https://api.github.com';

  constructor() {}

  // ============================================================================
  // Authentication
  // ============================================================================

  async login(token: string): Promise<boolean> {
    try {
      // Validate token by fetching user info
      const user = await this.fetchUser(token);
      
      this.config = {
        token,
        username: user.login,
        apiBaseUrl: this.baseUrl,
      };

      return true;
    } catch (error) {
      console.error('GitHub login failed:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.config = null;
  }

  async getStatus(): Promise<{ authenticated: boolean; username?: string }> {
    if (!this.config?.token) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      username: this.config.username,
    };
  }

  // ============================================================================
  // Repository Operations
  // ============================================================================

  async listRepos(): Promise<GitHubRepository[]> {
    this.ensureAuthenticated();

    const response = await this.fetch('/user/repos', {
      per_page: 100,
      sort: 'updated',
    });

    return response.map(this.mapRepository);
  }

  async getRepo(owner: string, name: string): Promise<GitHubRepository> {
    this.ensureAuthenticated();

    const response = await this.fetch(`/repos/${owner}/${name}`);
    return this.mapRepository(response);
  }

  async createRepo(
    name: string,
    options: {
      description?: string;
      private?: boolean;
      autoInit?: boolean;
    } = {}
  ): Promise<GitHubRepository> {
    this.ensureAuthenticated();

    const response = await this.fetch('/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: options.description,
        private: options.private || false,
        auto_init: options.autoInit || false,
      }),
    });

    return this.mapRepository(response);
  }

  // ============================================================================
  // Issue Operations
  // ============================================================================

  async listIssues(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      labels?: string[];
      per_page?: number;
    } = {}
  ): Promise<GitHubIssue[]> {
    this.ensureAuthenticated();

    const params = new URLSearchParams();
    if (options.state) params.set('state', options.state);
    if (options.labels) params.set('labels', options.labels.join(','));
    if (options.per_page) params.set('per_page', options.per_page.toString());

    const response = await this.fetch(
      `/repos/${owner}/${repo}/issues?${params.toString()}`
    );

    return response.map(this.mapIssue);
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    this.ensureAuthenticated();

    const response = await this.fetch(`/repos/${owner}/${repo}/issues/${issueNumber}`);
    return this.mapIssue(response);
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
    labels?: string[]
  ): Promise<GitHubIssue> {
    this.ensureAuthenticated();

    const response = await this.fetch(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        labels: labels || [],
      }),
    });

    return this.mapIssue(response);
  }

  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    updates: {
      title?: string;
      body?: string;
      state?: 'open' | 'closed';
      labels?: string[];
    }
  ): Promise<GitHubIssue> {
    this.ensureAuthenticated();

    const response = await this.fetch(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    return this.mapIssue(response);
  }

  // ============================================================================
  // Pull Request Operations
  // ============================================================================

  async listPullRequests(
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      head?: string;
      base?: string;
    } = {}
  ): Promise<GitHubPullRequest[]> {
    this.ensureAuthenticated();

    const params = new URLSearchParams();
    if (options.state) params.set('state', options.state);
    if (options.head) params.set('head', options.head);
    if (options.base) params.set('base', options.base);

    const response = await this.fetch(
      `/repos/${owner}/${repo}/pulls?${params.toString()}`
    );

    return response.map(this.mapPullRequest);
  }

  async getPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<GitHubPullRequest> {
    this.ensureAuthenticated();

    const response = await this.fetch(`/repos/${owner}/${repo}/pulls/${prNumber}`);
    return this.mapPullRequest(response);
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<GitHubPullRequest> {
    this.ensureAuthenticated();

    const response = await this.fetch(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        head,
        base,
        body,
      }),
    });

    return this.mapPullRequest(response);
  }

  async mergePullRequest(
    owner: string,
    repo: string,
    prNumber: number,
    options: {
      commitTitle?: string;
      commitMessage?: string;
      mergeMethod?: 'merge' | 'squash' | 'rebase';
    } = {}
  ): Promise<void> {
    this.ensureAuthenticated();

    await this.fetch(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
      method: 'PUT',
      body: JSON.stringify({
        commit_title: options.commitTitle,
        commit_message: options.commitMessage,
        merge_method: options.mergeMethod || 'merge',
      }),
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private ensureAuthenticated(): void {
    if (!this.config?.token) {
      throw new Error('GitHub client not authenticated');
    }
  }

  private async fetchUser(token: string): Promise<{ login: string }> {
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<any> {
    this.ensureAuthenticated();

    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `token ${this.config!.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  private mapRepository(data: any): GitHubRepository {
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      owner: data.owner.login,
      description: data.description,
      private: data.private,
      defaultBranch: data.default_branch,
      cloneUrl: data.clone_url,
      sshUrl: data.ssh_url,
      htmlUrl: data.html_url,
      lastPushedAt: data.pushed_at,
      stars: data.stargazers_count,
      forks: data.forks_count,
    };
  }

  private mapIssue(data: any): GitHubIssue {
    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      labels: data.labels.map((l: any) => l.name),
      assignees: data.assignees.map((a: any) => a.login),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      url: data.html_url,
    };
  }

  private mapPullRequest(data: any): GitHubPullRequest {
    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.merged ? 'merged' : data.state,
      head: data.head.ref,
      base: data.base.ref,
      author: data.user.login,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      url: data.html_url,
      draft: data.draft,
      mergeable: data.mergeable,
    };
  }
}
