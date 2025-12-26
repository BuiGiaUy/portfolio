import * as Sentry from '@sentry/nextjs';

/**
 * SENTRY CONFIGURATION (FRONTEND - Next.js)
 * 
 * Minimal production-ready error tracking for client-side:
 * - Captures unhandled exceptions
 * - Tracks network errors
 * - Attaches user context (userId only, no PII)
 */

export function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const environment = process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development';

  // Skip Sentry in development unless explicitly enabled
  if (!dsn || environment === 'development') {
    console.log('⚠️  Sentry disabled (no DSN or development mode)');
    return;
  }

  Sentry.init({
    dsn,
    environment,

    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session replay for debugging
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Error filtering
    beforeSend(event, hint) {
      // Don't send 404 errors
      if (event.exception?.values?.[0]?.value?.includes('404')) {
        return null;
      }

      // Don't send network errors that are user-related
      if (event.exception?.values?.[0]?.value?.includes('NetworkError')) {
        return null;
      }

      return event;
    },

    // Never send PII
    beforeBreadcrumb(breadcrumb) {
      // Remove sensitive data from breadcrumbs
      if (breadcrumb.category === 'console') {
        return null; // Skip console logs
      }

      if (breadcrumb.data?.cookie) {
        delete breadcrumb.data.cookie;
      }

      return breadcrumb;
    },

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });

  console.log('✅ Sentry initialized (frontend):', { environment });
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
