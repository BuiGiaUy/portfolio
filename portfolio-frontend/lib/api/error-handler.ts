/**
 * Centralized Error Handler
 * Handles API errors and provides user-friendly messages
 */

import { AxiosError } from 'axios';
import { ApiClientError, ErrorCode, ApiError } from './types';

/**
 * Map HTTP status codes to error codes
 */
const mapStatusToErrorCode = (status: number): ErrorCode => {
  switch (status) {
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 422:
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 408:
      return ErrorCode.TIMEOUT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorCode.SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN;
  }
};

/**
 * Get user-friendly error message
 */
const getUserFriendlyMessage = (code: ErrorCode, defaultMessage?: string): string => {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
    [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
    [ErrorCode.SERVER_ERROR]: 'A server error occurred. Please try again later.',
    [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
    [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
    [ErrorCode.UNKNOWN]: 'An unexpected error occurred.',
  };

  return defaultMessage || messages[code];
};

/**
 * Handle Axios errors
 */
export const handleAxiosError = (error: AxiosError<ApiError>): ApiClientError => {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new ApiClientError(
        getUserFriendlyMessage(ErrorCode.TIMEOUT),
        408,
        ErrorCode.TIMEOUT
      );
    }
    
    return new ApiClientError(
      getUserFriendlyMessage(ErrorCode.NETWORK_ERROR),
      0,
      ErrorCode.NETWORK_ERROR,
      error.message
    );
  }

  // HTTP error response
  const { status, data } = error.response;
  const errorCode = mapStatusToErrorCode(status);
  const message = data?.message || getUserFriendlyMessage(errorCode);

  return new ApiClientError(
    message,
    status,
    errorCode,
    data?.details
  );
};

/**
 * Handle generic errors
 */
export const handleGenericError = (error: unknown): ApiClientError => {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiClientError(
      error.message,
      0,
      ErrorCode.UNKNOWN,
      error
    );
  }

  return new ApiClientError(
    'An unexpected error occurred',
    0,
    ErrorCode.UNKNOWN,
    error
  );
};

/**
 * Log error for debugging
 */
export const logError = (error: ApiClientError, context?: string): void => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.group(`🚨 API Error${context ? ` - ${context}` : ''}`);
    console.error('Message:', error.message);
    console.error('Status:', error.statusCode);
    console.error('Code:', error.code);
    if (error.details) {
      console.error('Details:', error.details);
    }
    console.groupEnd();
  }
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: ApiClientError): boolean => {
  const retryableCodes = [
    ErrorCode.TIMEOUT,
    ErrorCode.NETWORK_ERROR,
    ErrorCode.SERVER_ERROR,
  ];
  
  return retryableCodes.includes(error.code);
};

/**
 * Check if error requires authentication
 */
export const isAuthError = (error: ApiClientError): boolean => {
  return error.code === ErrorCode.UNAUTHORIZED;
};
