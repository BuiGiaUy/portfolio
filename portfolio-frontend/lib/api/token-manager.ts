/**
 * Token Manager
 * Handles storage and retrieval of authentication tokens
 */

import { API_CONFIG } from './config';
import { AuthTokens, AuthUser } from './types';

class TokenManager {
  private isClient = typeof window !== 'undefined';

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem(API_CONFIG.auth.tokenKey);
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem(API_CONFIG.auth.refreshTokenKey);
  }

  /**
   * Get user from storage
   */
  getUser(): AuthUser | null {
    if (!this.isClient) return null;
    const userStr = localStorage.getItem(API_CONFIG.auth.userKey);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Set access token in storage
   */
  setAccessToken(token: string): void {
    if (!this.isClient) return;
    localStorage.setItem(API_CONFIG.auth.tokenKey, token);
  }

  /**
   * Set refresh token in storage
   */
  setRefreshToken(token: string): void {
    if (!this.isClient) return;
    localStorage.setItem(API_CONFIG.auth.refreshTokenKey, token);
  }

  /**
   * Set user in storage
   */
  setUser(user: AuthUser): void {
    if (!this.isClient) return;
    localStorage.setItem(API_CONFIG.auth.userKey, JSON.stringify(user));
  }

  /**
   * Set all auth data
   */
  setAuthData(tokens: AuthTokens, user?: AuthUser): void {
    this.setAccessToken(tokens.accessToken);
    this.setRefreshToken(tokens.refreshToken);
    if (user) {
      this.setUser(user);
    }
  }

  /**
   * Clear all auth data
   */
  clearAuthData(): void {
    if (!this.isClient) return;
    localStorage.removeItem(API_CONFIG.auth.tokenKey);
    localStorage.removeItem(API_CONFIG.auth.refreshTokenKey);
    localStorage.removeItem(API_CONFIG.auth.userKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get authorization header value
   */
  getAuthHeader(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return `${API_CONFIG.auth.tokenPrefix} ${token}`;
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
