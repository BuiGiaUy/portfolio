import { SetMetadata } from '@nestjs/common';

/**
 * Cache TTL Decorator
 *
 * Sets the cache Time-To-Live (TTL) for a route handler.
 * Used in conjunction with CacheInterceptor to control
 * how long responses are cached.
 *
 * @param seconds - Cache TTL in seconds
 *
 * @example
 * ```typescript
 * @Get('projects')
 * @UseInterceptors(CacheInterceptor)
 * @CacheTTL(120) // Cache for 2 minutes
 * async getProjects() { ... }
 * ```
 */
export const CACHE_TTL_KEY = 'cache_ttl';

export const CacheTTL = (seconds: number) =>
  SetMetadata(CACHE_TTL_KEY, seconds);
