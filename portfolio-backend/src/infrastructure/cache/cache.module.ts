import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisCacheService } from './redis-cache.service';
import { CacheInterceptor } from './cache.interceptor';
import { CacheInvalidationService } from './cache-invalidation.service';

/**
 * Cache Module
 *
 * Global module providing Redis caching capabilities across the application.
 * - Configures Redis client connection
 * - Provides RedisCacheService for manual cache operations
 * - Provides CacheInterceptor for automatic GET request caching
 * - Provides CacheInvalidationService for pattern-based cache invalidation
 *
 * Configuration:
 * Set REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env
 * Defaults: localhost:6379 with no password
 *
 * Exports:
 * - RedisCacheService: For manual cache operations
 * - CacheInterceptor: For automatic caching via @UseInterceptors
 * - CacheInvalidationService: For cache invalidation after mutations
 */
@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
          retryStrategy: (times: number) => {
            // Exponential backoff: 50ms, 100ms, 200ms, max 3000ms
            const delay = Math.min(times * 50, 3000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: false,
        });

        // Log connection events
        redis.on('connect', () => {
          console.log('✅ Redis client connected');
        });

        redis.on('ready', () => {
          console.log('✅ Redis client ready');
        });

        redis.on('error', (err) => {
          console.error('❌ Redis client error:', err);
        });

        redis.on('close', () => {
          console.log('🔌 Redis client connection closed');
        });

        redis.on('reconnecting', () => {
          console.log('🔄 Redis client reconnecting...');
        });

        return redis;
      },
    },
    RedisCacheService,
    CacheInterceptor,
    CacheInvalidationService,
  ],
  exports: [RedisCacheService, CacheInterceptor, CacheInvalidationService],
})
export class CacheModule {}
