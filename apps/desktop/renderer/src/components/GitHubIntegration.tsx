import { useState, useEffect } from 'react';
import { useStore } from '../store';

export function GitHubIntegration() {
  const githubAuth = useStore(s => s.githubAuth);
  const githubRepos = useStore(s => s.githubRepos);
  const loginToGitHub = useStore(s => s.loginToGitHub);
  const logoutFromGitHub = useStore(s => s.logoutFromGitHub);
  const loadGitHubRepos = useStore(s => s.loadGitHubRepos);

  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [showRepoList, setShowRepoList] = useState(false);

  useEffect(() => {
    if (githubAuth?.authenticated) {
      loadGitHubRepos();
    }
  }, [githubAuth?.authenticated, loadGitHubRepos]);

  const handleLogin = async () => {
    const token = prompt('Enter your GitHub Personal Access Token:');
    if (token) {
      await loginToGitHub(token);
    }
  };

  const handleLogout = async () => {
    await logoutFromGitHub();
    setSelectedRepo(null);
    setShowRepoList(false);
  };

  return (
    <div className="github-integration">
      <div className="github-header">
        <h3>GitHub Integration</h3>
        {githubAuth?.authenticated ? (
          <div className="github-auth-status">
            <span className="github-username">@{githubAuth.username}</span>
            <button onClick={handleLogout} className="github-logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="github-login-btn">
            Login to GitHub
          </button>
        )}
      </div>

      {githubAuth?.authenticated && (
        <div className="github-content">
          <div className="github-repo-selector">
            <button
              onClick={() => setShowRepoList(!showRepoList)}
              className="github-repo-toggle"
            >
              {selectedRepo || 'Select a repository'}
              <span className="github-arrow">{showRepoList ? '▲' : '▼'}</span>
            </button>

            {showRepoList && (
              <div className="github-repo-list">
                {githubRepos.map(repo => (
                  <div
                    key={repo.id}
                    className="github-repo-item"
                    onClick={() => {
                      setSelectedRepo(repo.full_name);
                      setShowRepoList(false);
                    }}
                  >
                    <span className="github-repo-name">{repo.full_name}</span>
                    <span className="github-repo-visibility">
                      {repo.private ? '🔒' : '🌐'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedRepo && (
            <div className="github-repo-actions">
              <h4>Repository Actions</h4>
              <div className="github-action-buttons">
                <button className="github-action-btn">
                  View Issues
                </button>
                <button className="github-action-btn">
                  View Pull Requests
                </button>
                <button className="github-action-btn">
                  Create Issue
                </button>
                <button className="github-action-btn">
                  Sync Repository
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
