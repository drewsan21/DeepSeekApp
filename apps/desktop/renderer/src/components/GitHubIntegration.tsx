// ============================================================================
// GitHub Integration UI - Repo browser, issue/PR management
// ============================================================================

import { useState } from 'react';
import { useStore } from '../store';
import {
  Github,
  GitBranch,
  GitPullRequest,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

export function GitHubIntegration() {
  const {
    githubAuthenticated,
    githubUsername,
    githubRepos,
    githubIssues,
    githubPRs,
    loginGitHub,
    logoutGitHub,
    refreshGitHubData,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'repos' | 'issues' | 'prs'>(
    'repos'
  );
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  const handleLogin = async () => {
    await loginGitHub();
  };

  const handleLogout = async () => {
    await logoutGitHub();
  };

  const handleRefresh = async () => {
    await refreshGitHubData();
  };

  const getIssueStatusIcon = (state: string) => {
    switch (state) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPRStatusIcon = (state: string) => {
    switch (state) {
      case 'open':
        return <GitPullRequest className="w-4 h-4 text-green-500" />;
      case 'merged':
        return <GitPullRequest className="w-4 h-4 text-purple-500" />;
      case 'closed':
        return <GitPullRequest className="w-4 h-4 text-red-500" />;
      default:
        return <GitPullRequest className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!githubAuthenticated) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">GitHub</h2>
        <div className="p-8 text-center bg-gray-800/50 rounded-xl border border-gray-700">
          <Github className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Connect to GitHub
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Sign in to access your repositories, issues, and pull requests
          </p>
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Github className="w-4 h-4" />
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-100">GitHub</h2>
          <span className="text-sm text-gray-400">@{githubUsername}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('repos')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'repos'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Repositories ({githubRepos.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'issues'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Issues ({githubIssues.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('prs')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'prs'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4" />
            Pull Requests ({githubPRs.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'repos' && (
          <>
            {githubRepos.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No repositories found
              </div>
            ) : (
              githubRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedRepo(repo.name)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-100 mb-1">
                        {repo.name}
                      </h3>
                      <p className="text-xs text-gray-400">{repo.description}</p>
                    </div>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          repo.private ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      />
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                    <span>⭐ {repo.stars}</span>
                    <span>🍴 {repo.forks}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'issues' && (
          <>
            {githubIssues.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No issues found
              </div>
            ) : (
              githubIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getIssueStatusIcon(issue.state)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-100">
                          {issue.title}
                        </h3>
                        <a
                          href={issue.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        #{issue.number} • {issue.repository}
                      </p>
                      <div className="flex items-center gap-2">
                        {issue.labels.map((label) => (
                          <span
                            key={label}
                            className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'prs' && (
          <>
            {githubPRs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No pull requests found
              </div>
            ) : (
              githubPRs.map((pr) => (
                <div
                  key={pr.id}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getPRStatusIcon(pr.state)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-100">
                          {pr.title}
                        </h3>
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        #{pr.number} • {pr.repository}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>
                          {pr.head} → {pr.base}
                        </span>
                        {pr.draft && (
                          <span className="px-2 py-0.5 bg-gray-700 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
