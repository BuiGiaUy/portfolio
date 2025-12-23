/**
 * Token Manager
 * Handles storage and retrieval of authentication tokens
 * Access token is stored in HttpOnly cookies (set by backend)
 * User data is stored in localStorage for client-side access
 */

import { API_CONFIG } from './config';
import { AuthTokens, AuthUser } from './types';

/**
 * Helper to get cookie value by name (client-side only)
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

class TokenManager {
  private isClient = typeof window !== 'undefined';

  /**
   * Get access token from cookies
   * Note: This reads from cookies set by the backend
   * HttpOnly cookies cannot be read by JavaScript, so this will return null
   * The token is automatically sent with requests via cookies
   */
  getAccessToken(): string | null {
    if (!this.isClient) return null;
    // Try to read from cookie (will be null for HttpOnly cookies)
    // This is mainly for checking if user is authenticated
    return getCookie('accessToken');
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
   * Set access token - NOT USED anymore
   * Access token is set as HttpOnly cookie by backend
   * Keeping this method for backward compatibility
   */
  setAccessToken(): void {
    // No-op: Access token is set by backend as HttpOnly cookie
    // We cannot set HttpOnly cookies from JavaScript
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
   * Note: Only stores user data in localStorage
   * Tokens are managed by backend via HttpOnly cookies
   */
  setAuthData(_tokens: AuthTokens, user?: AuthUser): void {
    // Tokens are set by backend as HttpOnly cookies
    // We only store user data
    if (user) {
      this.setUser(user);
    }
  }

  /**
   * Clear all auth data
   */
  clearAuthData(): void {
    if (!this.isClient) return;
    localStorage.removeItem(API_CONFIG.auth.userKey);
    // Cookies are cleared by backend on logout
  }

  /**
   * Check if user is authenticated
   * Check both cookie and user data
   */
  isAuthenticated(): boolean {
    // Check if we have user data (indicates logged in)
    return !!this.getUser();
  }

  /**
   * Get authorization header value
   * Returns null because auth is handled via cookies
   */
  getAuthHeader(): string | null {
    // Auth is handled via HttpOnly cookies
    // No need to manually set Authorization header
    return null;
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
