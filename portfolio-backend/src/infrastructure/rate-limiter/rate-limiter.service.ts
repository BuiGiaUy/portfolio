import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { createRedisClient } from './redis.config';

/**
 * Rate Limiter Service
 * 
 * Implements IP-based rate limiting using Redis INCR and EXPIRE commands.
 * 
 * Algorithm:
 * 1. Generate a key based on IP address: `rate-limit:{ip}`
 * 2. Increment the counter for this IP
 * 3. If this is the first request (counter = 1), set TTL to window duration
 * 4. Check if counter exceeds the limit
 * 5. Return whether the request is allowed and remaining quota
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: number;
}

export interface RateLimiterConfig {
  limit: number;
  windowSeconds: number;
}

@Injectable()
export class RateLimiterService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly limit: number = 100;
  private readonly windowSeconds: number = 900; // 15 minutes

  constructor(config?: RateLimiterConfig, redis?: Redis) {
    // Allow dependency injection for testing
    if (config) {
      this.limit = config.limit;
      this.windowSeconds = config.windowSeconds;
    }
    this.redis = redis || createRedisClient();
  }

  /**
   * Check if a request from the given IP is allowed
   * 
   * @param ip - Client IP address
   * @returns RateLimitResult with allowed status and remaining quota
   */
  async checkLimit(ip: string): Promise<RateLimitResult> {
    const key = this.getKey(ip);

    try {
      // Increment the counter for this IP
      const count = await this.redis.incr(key);

      // If this is the first request, set the expiration
      if (count === 1) {
        await this.redis.expire(key, this.windowSeconds);
      }

      // Get TTL to calculate reset time
      const ttl = await this.redis.ttl(key);
      const resetTime = ttl > 0 ? Date.now() + ttl * 1000 : undefined;

      // Check if limit is exceeded
      const allowed = count <= this.limit;
      const remaining = Math.max(0, this.limit - count);

      return {
        allowed,
        remaining,
        resetTime,
      };
    } catch (error) {
      // On Redis errors, fail open (allow the request) to prevent service disruption
      console.error('Rate limiter error:', error);
      return {
        allowed: true,
        remaining: this.limit,
      };
    }
  }

  /**
   * Generate Redis key for an IP address
   */
  private getKey(ip: string): string {
    return `rate-limit:${ip}`;
  }

  /**
   * Reset rate limit for a specific IP (useful for testing)
   */
  async reset(ip: string): Promise<void> {
    const key = this.getKey(ip);
    await this.redis.del(key);
  }

  /**
   * Get current count for an IP
   */
  async getCount(ip: string): Promise<number> {
    const key = this.getKey(ip);
    const count = await this.redis.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
