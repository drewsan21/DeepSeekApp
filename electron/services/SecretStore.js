/**
 * Secret Store - Secure credential storage using OS keyring
 * Stores API keys, tokens, and other sensitive data
 */

const keytar = require('keytar');

class SecretStore {
  constructor() {
    this.serviceName = 'DeepSeek Desktop';
  }

  /**
   * Store a secret
   */
  async set(key, value) {
    try {
      await keytar.setPassword(this.serviceName, key, value);
      return true;
    } catch (error) {
      console.error('Failed to store secret:', error);
      return false;
    }
  }

  /**
   * Retrieve a secret
   */
  async get(key) {
    try {
      const value = await keytar.getPassword(this.serviceName, key);
      return value;
    } catch (error) {
      console.error('Failed to retrieve secret:', error);
      return null;
    }
  }

  /**
   * Delete a secret
   */
  async delete(key) {
    try {
      await keytar.deletePassword(this.serviceName, key);
      return true;
    } catch (error) {
      console.error('Failed to delete secret:', error);
      return false;
    }
  }

  /**
   * Check if a secret exists
   */
  async has(key) {
    try {
      const value = await keytar.getPassword(this.serviceName, key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Store API key for a provider
   */
  async setApiKey(providerId, apiKey) {
    return await this.set(`api_key_${providerId}`, apiKey);
  }

  /**
   * Retrieve API key for a provider
   */
  async getApiKey(providerId) {
    return await this.get(`api_key_${providerId}`);
  }

  /**
   * Delete API key for a provider
   */
  async deleteApiKey(providerId) {
    return await this.delete(`api_key_${providerId}`);
  }

  /**
   * Store OAuth token
   */
  async setOAuthToken(provider, token) {
    return await this.set(`oauth_token_${provider}`, JSON.stringify(token));
  }

  /**
   * Retrieve OAuth token
   */
  async getOAuthToken(provider) {
    const value = await this.get(`oauth_token_${provider}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Delete OAuth token
   */
  async deleteOAuthToken(provider) {
    return await this.delete(`oauth_token_${provider}`);
  }

  /**
   * Store user credentials
   */
  async setUserCredentials(userId, credentials) {
    return await this.set(`user_credentials_${userId}`, JSON.stringify(credentials));
  }

  /**
   * Retrieve user credentials
   */
  async getUserCredentials(userId) {
    const value = await this.get(`user_credentials_${userId}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Delete user credentials
   */
  async deleteUserCredentials(userId) {
    return await this.delete(`user_credentials_${userId}`);
  }

  /**
   * Clear all secrets (for logout/reset)
   */
  async clearAll() {
    try {
      // Note: keytar doesn't have a "clear all" method
      // We need to delete known keys
      const providers = ['deepseek-api', 'qwen-account', 'custom-openai'];
      
      for (const provider of providers) {
        await this.deleteApiKey(provider);
        await this.deleteOAuthToken(provider);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear secrets:', error);
      return false;
    }
  }
}

module.exports = { SecretStore };
