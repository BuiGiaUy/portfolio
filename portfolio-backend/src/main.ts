// IMPORTANT: Import Sentry BEFORE anything else
import { initSentry } from './infrastructure/observability/sentry.config';
initSentry();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimiterMiddleware } from './infrastructure/rate-limiter/rate-limiter.middleware';
import { RateLimiterService } from './infrastructure/rate-limiter/rate-limiter.service';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './infrastructure/observability/global-exception.filter';
import { StructuredLogger } from './infrastructure/logging/structured-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Use structured logger for NestJS internal logs
    bufferLogs: true,
  });

  // Get structured logger instance
  const logger = app.get(StructuredLogger);
  app.useLogger(logger);

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Apply cookie parser for auth
  app.use(cookieParser());

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS with credentials support
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Apply rate limiter middleware globally
  const rateLimiterService = app.get(RateLimiterService);
  app.use(
    new RateLimiterMiddleware(rateLimiterService).use.bind(
      new RateLimiterMiddleware(rateLimiterService),
    ),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.logWithMetadata(
    `🚀 Application started on port ${port}`,
    {
      environment: process.env.NODE_ENV || 'development',
      port,
    },
    'Bootstrap',
  );
}

void bootstrap();
