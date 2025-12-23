/**
 * Authentication Hooks
 * React hooks for authentication state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService } from './auth.service';
import { AuthUser, LoginCredentials, RegisterData, ApiClientError } from './types';

/**
 * Auth State
 */
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApiClientError | null;
}

/**
 * useAuth Hook
 * Main authentication hook with login, logout, and user state
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Try to get current user from API
          const user = await authService.getCurrentUser();
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // No token, user is not authenticated
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        // Failed to get user, clear auth
        authService.logout();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error as ApiClientError,
        });
      }
    };

    initAuth();

    // Listen for auth events
    const handleLogin = (event: Event) => {
      const customEvent = event as CustomEvent<AuthUser>;
      setState((prev) => ({
        ...prev,
        user: customEvent.detail,
        isAuthenticated: true,
        error: null,
      }));
    };

    const handleLogout = () => {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    };

    window.addEventListener('auth:login', handleLogin);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:login', handleLogin);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  /**
   * Login
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.login(credentials);
      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as ApiClientError,
      }));
      throw error;
    }
  }, []);

  /**
   * Register
   */
  const register = useCallback(async (data: RegisterData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.register(data);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as ApiClientError,
      }));
      throw error;
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Still clear local state even if API call fails
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error as ApiClientError,
      });
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setState((prev) => ({ ...prev, user }));
      return user;
    } catch (error) {
      setState((prev) => ({ ...prev, error: error as ApiClientError }));
      throw error;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    hasRole: (role: string) => authService.hasRole(role),
    hasAnyRole: (roles: string[]) => authService.hasAnyRole(roles),
    hasAllRoles: (roles: string[]) => authService.hasAllRoles(roles),
  };
}

/**
 * useRequireAuth Hook
 * Redirects to login if user is not authenticated
 */
export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }
  }, [isAuthenticated, isLoading, redirectUrl]);

  return { isAuthenticated, isLoading };
}

/**
 * useRequireRole Hook
 * Redirects if user doesn't have required role
 */
export function useRequireRole(role: string, redirectUrl = '/unauthorized') {
  const { user, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !hasRole(role)) {
      // Redirect to unauthorized page
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
    }
  }, [user, isLoading, role, hasRole, redirectUrl]);

  return { hasRole: hasRole(role), isLoading };
}
