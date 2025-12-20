/**
 * Authentication Utilities
 * Helper functions for auth checks in client components
 */

'use client';

/**
 * Check if user is authenticated based on cookie
 * Note: This is a client-side check only. Server-side protection in middleware.ts
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for accessToken cookie
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => cookie.trim().startsWith('accessToken='));
}

/**
 * Get the current access token from cookies
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
  
  if (!tokenCookie) return null;
  
  return tokenCookie.split('=')[1];
}

/**
 * Clear authentication cookies
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * React hook for auth state
 */
import { useState, useEffect } from 'react';

export function useAuthState() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setIsLoading(false);
  }, []);

  return {
    isAuthenticated: isAuth,
    isLoading,
    token: getAccessToken(),
  };
}
