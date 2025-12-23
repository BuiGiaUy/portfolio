/**
 * API Client
 * Axios instance with interceptors for authentication, retry, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';
import { tokenManager } from './token-manager';
import { handleAxiosError, logError } from './error-handler';
import { RequestConfig, RefreshTokenResponse } from './types';

/**
 * Extended Axios Request Config with custom properties
 */
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  skipAuth?: boolean;
  skipRefresh?: boolean;
  maxRetries?: number;
}

/**
 * API Client Class
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
      withCredentials: true, // Send cookies with requests
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Request Interceptor
   * Attaches access token to requests
   */
  private setupRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const extendedConfig = config as ExtendedAxiosRequestConfig;
        
        // Skip auth for certain requests
        if (extendedConfig.skipAuth) {
          return config;
        }

        // Attach access token
        const authHeader = tokenManager.getAuthHeader();
        if (authHeader) {
          config.headers.Authorization = authHeader;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Response Interceptor
   * Handles 401 errors and token refresh
   */
  private setupResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        // Handle network errors or no response
        if (!error.response) {
          const apiError = handleAxiosError(error);
          logError(apiError, 'Network Error');
          return Promise.reject(apiError);
        }
        const hasAccessToken = !!tokenManager.getAccessToken();
        const { status } = error.response;
        const AUTH_EXCLUDED_ENDPOINTS = [
          API_CONFIG.endpoints.login,
          API_CONFIG.endpoints.register,
          API_CONFIG.endpoints.refresh,
          API_CONFIG.endpoints.logout,
        ];
        const isAuthEndpoint = AUTH_EXCLUDED_ENDPOINTS.some((url) =>
          originalRequest.url?.includes(url)
        );
        // Handle 401 Unauthorized - Token refresh
        if (
          status === 401 &&
          hasAccessToken &&
          !originalRequest._retry &&
          !originalRequest.skipRefresh &&
          !isAuthEndpoint
        ) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.handleTokenRefresh();
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `${API_CONFIG.auth.tokenPrefix} ${newAccessToken}`;
            return this.axiosInstance(originalRequest);
          } catch {
            // Refresh failed - clear auth and redirect to login
            tokenManager.clearAuthData();
            
            // Emit auth error event for app-wide handling
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:logout', { 
                detail: { reason: 'token_refresh_failed' } 
              }));
            }
            
            const apiError = handleAxiosError(error);
            logError(apiError, 'Auth Error');
            return Promise.reject(apiError);
          }
        }

        // Handle retryable errors (5xx, timeouts, etc.)
        if (this.shouldRetry(originalRequest, status)) {
          return this.retryRequest(originalRequest);
        }

        // Handle other errors
        const apiError = handleAxiosError(error);
        logError(apiError, `HTTP ${status}`);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Handle token refresh
   */
  private async handleTokenRefresh(): Promise<string> {
    // If already refreshing, wait for it
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await this.axiosInstance.post<RefreshTokenResponse>(
        API_CONFIG.endpoints.refresh,
        {}, // Empty body - token comes from cookie
        { skipAuth: true, skipRefresh: true } as ExtendedAxiosRequestConfig
      );

      const { accessToken } = response.data;

      // Notify all subscribers
      this.refreshSubscribers.forEach((callback) => callback(accessToken));
      this.refreshSubscribers = [];

      return accessToken;
    } catch (error) {
      this.refreshSubscribers = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(config: ExtendedAxiosRequestConfig, status: number): boolean {
    const retryCount = config._retryCount || 0;
    const maxRetries = config.maxRetries ?? API_CONFIG.retry.maxRetries;
    
    return (
      retryCount < maxRetries &&
      (API_CONFIG.retry.retryableStatusCodes as readonly number[]).includes(status)
    );
  }

  /**
   * Retry failed request with exponential backoff
   */
  private async retryRequest(config: ExtendedAxiosRequestConfig): Promise<AxiosResponse> {
    const retryCount = (config._retryCount || 0) + 1;
    config._retryCount = retryCount;

    // Exponential backoff: 1s, 2s, 4s, etc.
    const delay = API_CONFIG.retry.retryDelay * Math.pow(2, retryCount - 1);

    console.log(`🔄 Retrying request (attempt ${retryCount}/${config.maxRetries ?? API_CONFIG.retry.maxRetries}) after ${delay}ms`);

    await new Promise((resolve) => setTimeout(resolve, delay));

    return this.axiosInstance(config);
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig & RequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig & RequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig & RequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig & RequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig & RequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Get raw axios instance (for advanced use cases)
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
