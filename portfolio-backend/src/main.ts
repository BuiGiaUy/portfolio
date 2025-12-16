import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RateLimiterMiddleware } from './infrastructure/rate-limiter/rate-limiter.middleware';
import { RateLimiterService } from './infrastructure/rate-limiter/rate-limiter.service';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Enable CORS
  app.enableCors();

  // Apply rate limiter middleware globally
  const rateLimiterService = app.get(RateLimiterService);
  app.use(
    new RateLimiterMiddleware(rateLimiterService).use.bind(
      new RateLimiterMiddleware(rateLimiterService),
    ),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
