/**
 * API Configuration
 * Centralized configuration for API client
 */

export const API_CONFIG = {
  // Base URL from environment or default
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  
  // Timeout in milliseconds
  timeout: 30000,
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // Base delay in ms
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
  
  // Auth configuration
  auth: {
    tokenKey: 'access_token',
    userKey: 'user',
    tokenPrefix: 'Bearer',
  },
  
  // Endpoints
  endpoints: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * Get API base URL
 */
export const getApiBaseUrl = (): string => {
  return API_CONFIG.baseURL;
};

/**
 * Get full endpoint URL
 */
export const getEndpointUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};
