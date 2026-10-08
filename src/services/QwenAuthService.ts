/**
 * Qwen Authentication Service
 * 
 * Handles OAuth2 authentication flow with Qwen API
 * Stores tokens securely in OS keyring
 */

import { EventEmitter } from 'node:events';

export interface QwenAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface QwenTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export interface QwenUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface QwenAuthState {
  authenticated: boolean;
  user: QwenUser | null;
  tokens: QwenTokens | null;
}

export class QwenAuthService extends EventEmitter {
  private config: QwenAuthConfig;
  private state: QwenAuthState;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  // Qwen API endpoints
  private readonly AUTH_URL = 'https://account.qwen.ai/oauth/authorize';
  private readonly TOKEN_URL = 'https://account.qwen.ai/oauth/token';
  private readonly USERINFO_URL = 'https://account.qwen.ai/oauth/userinfo';
  private readonly REVOKE_URL = 'https://account.qwen.ai/oauth/revoke';

  constructor(config: QwenAuthConfig) {
    super();
    this.config = config;
    this.state = {
      authenticated: false,
      user: null,
      tokens: null,
    };
  }

  /**
   * Start OAuth2 authentication flow
   * Returns authorization URL to redirect user to
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' '),
      state: this.generateState(),
    });

    return `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<QwenTokens> {
    try {
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const tokens: QwenTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        tokenType: data.token_type,
      };

      await this.setTokens(tokens);
      await this.fetchUserInfo();
      this.scheduleTokenRefresh();

      this.emit('authenticated', this.state);
      return tokens;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<QwenTokens> {
    if (!this.state.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.state.tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const tokens: QwenTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || this.state.tokens.refreshToken,
        expiresAt: Date.now() + (data.expires_in * 1000),
        tokenType: data.token_type,
      };

      await this.setTokens(tokens);
      this.scheduleTokenRefresh();

      this.emit('tokenRefreshed', tokens);
      return tokens;
    } catch (error) {
      this.emit('error', error);
      // If refresh fails, user needs to re-authenticate
      await this.logout();
      throw error;
    }
  }

  /**
   * Fetch user information from Qwen API
   */
  private async fetchUserInfo(): Promise<void> {
    if (!this.state.tokens?.accessToken) {
      throw new Error('No access token available');
    }

    try {
      const response = await fetch(this.USERINFO_URL, {
        headers: {
          Authorization: `Bearer ${this.state.tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      const data = await response.json();
      
      const user: QwenUser = {
        id: data.sub,
        email: data.email,
        name: data.name,
        avatar: data.picture,
      };

      this.state.user = user;
      this.state.authenticated = true;

      this.emit('userLoaded', user);
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    if (!this.state.tokens) {
      return;
    }

    // Refresh 5 minutes before expiration
    const refreshTime = this.state.tokens.expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshAccessToken().catch(error => {
          console.error('Token refresh failed:', error);
        });
      }, refreshTime);
    }
  }

  /**
   * Get current authentication state
   */
  getState(): QwenAuthState {
    return { ...this.state };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.authenticated && this.state.tokens !== null;
  }

  /**
   * Get access token for API calls
   */
  getAccessToken(): string | null {
    return this.state.tokens?.accessToken || null;
  }

  /**
   * Set tokens (for persistence)
   */
  async setTokens(tokens: QwenTokens): Promise<void> {
    this.state.tokens = tokens;
    
    // In real implementation, store in OS keyring
    // For now, just keep in memory
    // TODO: Integrate with electron-store or keytar
  }

  /**
   * Load tokens from storage
   */
  async loadTokens(): Promise<boolean> {
    // TODO: Load from OS keyring
    // For now, return false (no stored tokens)
    return false;
  }

  /**
   * Logout and clear all tokens
   */
  async logout(): Promise<void> {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    if (this.state.tokens?.accessToken) {
      try {
        // Revoke token on server
        await fetch(this.REVOKE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            token: this.state.tokens.accessToken,
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
          }),
        });
      } catch (error) {
        console.error('Token revocation failed:', error);
      }
    }

    this.state = {
      authenticated: false,
      user: null,
      tokens: null,
    };

    // TODO: Clear from OS keyring
    this.emit('logout');
  }

  /**
   * Generate random state parameter for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validate OAuth state parameter
   */
  validateState(state: string): boolean {
    // TODO: Implement proper state validation
    // Store state in session and compare
    return state.length > 0;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
let authInstance: QwenAuthService | null = null;

export function getQwenAuthService(config?: QwenAuthConfig): QwenAuthService {
  if (!authInstance && config) {
    authInstance = new QwenAuthService(config);
  }
  
  if (!authInstance) {
    throw new Error('QwenAuthService not initialized. Provide config on first call.');
  }
  
  return authInstance;
}

export function resetQwenAuthService(): void {
  if (authInstance) {
    authInstance.destroy();
    authInstance = null;
  }
}
