import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { RedisCacheService } from './redis-cache.service';
import { CACHE_TTL_KEY } from './cache-ttl.decorator';

/**
 * Cache Interceptor
 *
 * Implements cache-aside pattern for GET requests only.
 * - Checks cache before executing handler
 * - Returns cached data if available
 * - Caches response data with configurable TTL
 *
 * Supports @CacheTTL decorator for per-route TTL configuration.
 * Default TTL: 60 seconds
 *
 * Usage:
 * @UseInterceptors(CacheInterceptor)
 * @CacheTTL(120) // Optional: Override default TTL
 * @Get('endpoint')
 * async getEndpoint() { ... }
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly DEFAULT_TTL = 60; // 60 seconds

  constructor(
    private readonly cacheService: RedisCacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const httpMethod = request.method;

    // Only cache GET requests
    if (httpMethod !== 'GET') {
      this.logger.debug(`Skipping cache for non-GET request: ${httpMethod}`);
      return next.handle();
    }

    // Get TTL from decorator or use default
    const ttl = this.getTtl(context);

    // Generate cache key from request URL
    const cacheKey = this.generateCacheKey(request);

    // Try to get cached data
    try {
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData !== null) {
        this.logger.debug(`Returning cached data for: ${cacheKey}`);
        return of(cachedData); // Return cached data as Observable
      }
    } catch (error) {
      // Log error but continue to execute handler
      this.logger.error(`Cache get error for ${cacheKey}:`, error);
    }

    // Execute handler and cache the result
    this.logger.debug(`Cache miss, executing handler for: ${cacheKey}`);

    return next.handle().pipe(
      tap(async (data) => {
        // Cache the response data
        if (data !== undefined && data !== null) {
          try {
            await this.cacheService.set(cacheKey, data, ttl);
            this.logger.debug(
              `Cached response for: ${cacheKey} with TTL: ${ttl}s`,
            );
          } catch (error) {
            // Log error but don't fail the request
            this.logger.error(`Cache set error for ${cacheKey}:`, error);
          }
        }
      }),
    );
  }

  /**
   * Get TTL from @CacheTTL decorator or use default
   *
   * @param context - Execution context
   * @returns TTL in seconds
   */
  private getTtl(context: ExecutionContext): number {
    const ttl = this.reflector.getAllAndOverride<number>(CACHE_TTL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return ttl ?? this.DEFAULT_TTL;
  }

  /**
   * Generate cache key from request
   *
   * Format: cache:{url}?{queryParams}
   * Example: cache:/projects/user/123?sort=desc
   *
   * @param request - Express request object
   * @returns Generated cache key
   */
  private generateCacheKey(request: Request): string {
    const baseUrl = request.url;
    return `cache:${baseUrl}`;
  }
}
