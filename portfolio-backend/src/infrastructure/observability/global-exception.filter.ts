import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import * as Sentry from '@sentry/nestjs';
import { StructuredLogger } from '../logging/structured-logger.service';

/**
 * GLOBAL EXCEPTION FILTER
 * 
 * Catches all unhandled exceptions and:
 * 1. Logs them via StructuredLogger
 * 2. Sends to Sentry (for 5xx errors)
 * 3. Returns safe error response (no stack traces in production)
 */

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const isServerError = status >= 500;

    // Log error
    this.logger.errorWithMetadata(
      message,
      {
        statusCode: status,
        path: request.url,
        method: request.method,
        userId: request.user?.userId,
        trace: exception instanceof Error ? exception.stack : undefined,
      },
      'GlobalExceptionFilter',
    );

    // Send to Sentry (only server errors)
    if (isServerError) {
      Sentry.captureException(exception, {
        extra: {
          path: request.url,
          method: request.method,
          userId: request.user?.userId,
        },
      });
    }

    // Return safe error response
    const errorResponse = {
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      // Only include stack trace in development
      ...(process.env.NODE_ENV !== 'production' &&
        exception instanceof Error && { stack: exception.stack }),
    };

    response.status(status).json(errorResponse);
  }
}
