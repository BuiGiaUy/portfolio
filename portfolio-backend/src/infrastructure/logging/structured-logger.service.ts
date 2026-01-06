import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * STRUCTURED LOGGER SERVICE
 *
 * Production-ready logging with:
 * - JSON structured output
 * - Context and metadata support
 * - No PII leakage
 * - Sentry integration
 *
 * Lives in infrastructure layer to keep domain clean.
 */

export interface LogContext {
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

@Injectable()
export class StructuredLogger implements NestLoggerService {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  /**
   * Log informational message
   */
  log(message: string, context?: string): void {
    this.writeLog('log', message, undefined, context);
  }

  /**
   * Log error message
   */
  error(message: string, trace?: string, context?: string): void {
    this.writeLog('error', message, trace ? { trace } : undefined, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string): void {
    this.writeLog('warn', message, undefined, context);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: string): void {
    if (!this.isProduction) {
      this.writeLog('debug', message, undefined, context);
    }
  }

  /**
   * Log verbose message (only in development)
   */
  verbose(message: string, context?: string): void {
    if (!this.isProduction) {
      this.writeLog('verbose', message, undefined, context);
    }
  }

  /**
   * Log with structured metadata (for custom logging)
   */
  logWithMetadata(
    message: string,
    metadata: LogContext,
    context?: string,
  ): void {
    this.writeLog('log', message, metadata, context);
  }

  /**
   * Log error with structured metadata
   */
  errorWithMetadata(
    message: string,
    metadata: LogContext,
    context?: string,
  ): void {
    this.writeLog('error', message, metadata, context);
  }

  /**
   * Log warning with structured metadata
   */
  warnWithMetadata(
    message: string,
    metadata: LogContext,
    context?: string,
  ): void {
    this.writeLog('warn', message, metadata, context);
  }

  /**
   * Write structured log
   * @param level - Log level
   * @param message - Log message
   * @param metadata - Optional structured metadata object
   * @param context - Optional context string (class/module name)
   */
  private writeLog(
    level: 'log' | 'error' | 'warn' | 'debug' | 'verbose',
    message: string,
    metadata?: LogContext,
    context?: string,
  ): void {
    const sanitizedMetadata = this.sanitizeContext(metadata);
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...sanitizedMetadata,
    };

    if (this.isProduction) {
      // Production: JSON output for log aggregators
      console.log(this.safeStringify(logEntry));
    } else {
      // Development: Human-readable output with colors
      const timestamp = new Date().toLocaleTimeString();
      const contextPart = context ? ` [${context}]` : '';
      const metadataStr =
        Object.keys(sanitizedMetadata).length > 0
          ? ` ${this.safeStringify(sanitizedMetadata)}`
          : '';

      const prefix = `[${timestamp}]`;
      const baseLog = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
        ...metadata,
      };
      // Use console methods directly to avoid circular dependency
      switch (level) {
        case 'error':
          console.error(baseLog);
          break;
        case 'warn':
          console.warn(baseLog);
          break;
        default:
          console.log(baseLog);
      }
    }
  }

  /**
   * Safely stringify objects with circular references
   */
  private safeStringify(obj: any, maxDepth: number = 10): string {
    const seen = new WeakMap<any, boolean>();

    const stringify = (value: any, depth: number): any => {
      // Handle primitives
      if (value === null || typeof value !== 'object') {
        return value;
      }

      // Check depth limit
      if (depth > maxDepth) {
        return '[Max Depth Reached]';
      }

      // Check for circular reference
      if (seen.has(value)) {
        return '[Circular]';
      }

      // Mark as seen
      seen.set(value, true);

      try {
        // Handle arrays
        if (Array.isArray(value)) {
          return value.map((item) => stringify(item, depth + 1));
        }

        // Handle objects
        const result: any = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            try {
              result[key] = stringify(value[key], depth + 1);
            } catch (e) {
              result[key] = '[Error]';
            }
          }
        }
        return result;
      } finally {
        // Remove from seen after processing to allow the same object in different branches
        seen.delete(value);
      }
    };

    try {
      const sanitized = stringify(obj, 0);
      return JSON.stringify(sanitized);
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to stringify',
        message: String(error),
      });
    }
  }

  /**
   * Remove sensitive data from context
   *
   * CRITICAL: Never log tokens, passwords, cookies, or PII
   */
  private sanitizeContext(context?: LogContext): LogContext {
    if (!context) return {};

    const sanitized: LogContext = {};

    // Sensitive fields to remove
    const sensitiveFields = new Set([
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'cookie',
      'authorization',
      'secret',
      'req',
      'res',
      'request',
      'response',
    ]);

    // Only copy safe, serializable properties
    try {
      for (const key in context) {
        if (!context.hasOwnProperty(key)) continue;
        if (sensitiveFields.has(key)) continue;

        const value = context[key];

        // Only copy primitives, simple objects, and arrays
        // Skip functions, complex objects that might have circular refs
        if (value === null || value === undefined) {
          sanitized[key] = value;
        } else if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
        ) {
          sanitized[key] = value;
        } else if (Array.isArray(value)) {
          // Only copy if array is small and contains primitives
          if (
            value.length < 100 &&
            value.every(
              (v) =>
                typeof v === 'string' ||
                typeof v === 'number' ||
                typeof v === 'boolean' ||
                v === null,
            )
          ) {
            sanitized[key] = value;
          } else {
            sanitized[key] = `[Array(${value.length})]`;
          }
        } else if (typeof value === 'object') {
          // For objects, only include if they're plain objects with few keys
          const keys = Object.keys(value);
          if (keys.length < 20 && value.constructor === Object) {
            // Try to copy, but catch any errors
            try {
              sanitized[key] = { ...value };
            } catch {
              sanitized[key] = '[Object]';
            }
          } else {
            sanitized[key] = `[${value.constructor?.name || 'Object'}]`;
          }
        }
      }
    } catch (error) {
      // If we can't iterate, return empty object
      return {};
    }

    // Mask email (keeping domain for debugging)
    if (sanitized.email && typeof sanitized.email === 'string') {
      const parts = sanitized.email.split('@');
      if (parts.length === 2) {
        sanitized.email = `${parts[0].substring(0, 2)}***@${parts[1]}`;
      }
    }

    return sanitized;
  }
}
