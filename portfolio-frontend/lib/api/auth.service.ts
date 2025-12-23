/**
 * Authentication Service
 * Handles login, logout, register, and token refresh
 */

import { apiClient } from './client';
import { tokenManager } from './token-manager';
import { API_CONFIG } from './config';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  AuthUser,
  RefreshTokenResponse,
} from './types';

/**
 * Auth Service Class
 */
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.endpoints.login,
      credentials,
      { skipAuth: true }
    );

    // Store tokens and user
    tokenManager.setAuthData(
      {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
      response.user
    );

    // Emit login event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
    }

    return response;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.endpoints.register,
      data,
      { skipAuth: true }
    );

    // Store tokens and user
    tokenManager.setAuthData(
      {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
      response.user
    );

    // Emit login event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:login', { detail: response.user }));
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint - refresh token sent via cookie
      await apiClient.post(API_CONFIG.endpoints.logout, {});
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local auth data
      tokenManager.clearAuthData();

      // Emit logout event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'user_logout' } }));
      }
    }
  }

  /**
   * Refresh access token
   * Note: Tokens are managed by backend via HttpOnly cookies
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    // Refresh token is sent automatically as HttpOnly cookie
    const response = await apiClient.post<RefreshTokenResponse>(
      API_CONFIG.endpoints.refresh,
      {}, // Empty body - token comes from cookie
      { skipAuth: true, skipRefresh: true }
    );

    // Tokens are set by backend as HttpOnly cookies
    // No need to store them in localStorage

    return response;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(API_CONFIG.endpoints.me);
    
    // Update stored user
    tokenManager.setUser(response);
    
    return response;
  }

  /**
   * Get stored user (from localStorage)
   */
  getStoredUser(): AuthUser | null {
    return tokenManager.getUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = tokenManager.getUser();
    return user?.roles.includes(role) ?? false;
  }

  /**
   * Check if user has any of the roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = tokenManager.getUser();
    return roles.some((role) => user?.roles.includes(role)) ?? false;
  }

  /**
   * Check if user has all roles
   */
  hasAllRoles(roles: string[]): boolean {
    const user = tokenManager.getUser();
    return roles.every((role) => user?.roles.includes(role)) ?? false;
  }
}

// Export singleton instance
export const authService = new AuthService();
