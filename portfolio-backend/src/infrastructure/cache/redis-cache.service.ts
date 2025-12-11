import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

/**
 * Redis Cache Service
 *
 * Infrastructure layer service implementing cache-aside pattern.
 * Provides simple key-value operations with TTL support.
 *
 * This service abstracts Redis operations, making it easy to:
 * - Cache frequently accessed data
 * - Reduce database load
 * - Improve response times
 */
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  /**
   * Get cached value by key
   *
   * @param key - Cache key
   * @returns Parsed JSON value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);

      if (!value) {
        this.logger.debug(`Cache miss for key: ${key}`);
        return null;
      }

      this.logger.debug(`Cache hit for key: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null; // Fail gracefully - don't break the app if cache fails
    }
  }

  /**
   * Set cache value with optional TTL
   *
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttlSeconds - Time to live in seconds (default: 60 seconds)
   */
  async set(key: string, value: unknown, ttlSeconds: number = 60): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);

      if (ttlSeconds > 0) {
        await this.redisClient.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redisClient.set(key, serializedValue);
      }

      this.logger.debug(`Cache set for key: ${key} with TTL: ${ttlSeconds}s`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      // Fail gracefully - don't throw error if cache fails
    }
  }

  /**
   * Delete cache entry by key
   *
   * @param key - Cache key to delete
   * @returns Number of keys deleted (0 or 1)
   */
  async del(key: string): Promise<number> {
    try {
      const result = await this.redisClient.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      return 0; // Fail gracefully
    }
  }

  /**
   * Delete multiple cache entries by pattern
   * Useful for invalidating related cache entries
   *
   * @param pattern - Redis key pattern (e.g., "cache:projects:*")
   * @returns Number of keys deleted
   */
  async delByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redisClient.keys(pattern);

      if (keys.length === 0) {
        this.logger.debug(`No keys found matching pattern: ${pattern}`);
        return 0;
      }

      const result = await this.redisClient.del(...keys);
      this.logger.debug(`Deleted ${result} keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern ${pattern}:`, error);
      return 0; // Fail gracefully
    }
  }

  /**
   * Check Redis connection health
   *
   * @returns true if connected, false otherwise
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }
}
