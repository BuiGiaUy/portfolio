import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * SENTRY CONFIGURATION (BACKEND)
 * 
 * Minimal production-ready error tracking:
 * - Captures unhandled exceptions
 * - Tracks API errors (4xx/5xx)
 * - Attaches user context (userId only, no PII)
 * - Performance monitoring
 * 
 * Initialize this BEFORE importing any other modules.
 */

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || 'development';

  // Skip Sentry in development unless explicitly enabled
  if (!dsn || environment === 'development') {
    console.log('⚠️  Sentry disabled (no DSN or development mode)');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in staging

    // Profiling (optional, useful for performance issues)
    profilesSampleRate: 0.1,
    integrations: [
      nodeProfilingIntegration(),
    ],

    // Error filtering
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Don't send validation errors (400)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 400 || status === 404) {
          return null; // Don't send to Sentry
        }
      }

      return event;
    },

    // Never send PII
    beforeBreadcrumb(breadcrumb) {
      // Remove cookies from breadcrumbs
      if (breadcrumb.data?.cookie) {
        delete breadcrumb.data.cookie;
      }
      if (breadcrumb.data?.authorization) {
        delete breadcrumb.data.authorization;
      }
      return breadcrumb;
    },
  });

  console.log('✅ Sentry initialized:', { environment, dsn: dsn.substring(0, 30) + '...' });
}

/**
 * Set user context for Sentry
 * Call this after successful authentication
 */
export function setSentryUser(userId: string): void {
  Sentry.setUser({ id: userId });
}

/**
 * Clear user context
 * Call this after logout
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Manually capture exception
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message (for non-errors)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  Sentry.captureMessage(message, level);
}
