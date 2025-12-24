/**
 * API Client Library
 * Main entry point for all API-related functionality
 */

// Core client
export { apiClient } from './client';

// Services
export { authService } from './auth.service';

// Token management
export { tokenManager } from './token-manager';

// Cookie utilities
export {
  getAllCookies,
  getCookie,
  deleteCookie,
  clearAuthCookies,
  hasAuthCookies,
  logCookies,
} from './cookie-utils';

// Configuration
export { API_CONFIG, getApiBaseUrl, getEndpointUrl } from './config';

// Error handling
export {
  handleAxiosError,
  handleGenericError,
  logError,
  isRetryableError,
  isAuthError,
} from './error-handler';

// Hooks
export { useAuth, useRequireAuth, useRequireRole } from './hooks';

// Types
export type {
  ApiResponse,
  ApiError,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthUser,
  AuthResponse,
  RefreshTokenResponse,
  RequestConfig,
  ApiClientError,
} from './types';

export { ErrorCode } from './types';
