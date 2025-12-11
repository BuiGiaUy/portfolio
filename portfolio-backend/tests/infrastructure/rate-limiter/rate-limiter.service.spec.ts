import { RateLimiterService } from '../../../src/infrastructure/rate-limiter/rate-limiter.service';
import type { Redis } from 'ioredis';

/**
 * Mock Redis Client for Testing
 */
class MockRedis {
  private store: Map<string, { value: number; ttl?: number }> = new Map();

  async incr(key: string): Promise<number> {
    const current = this.store.get(key);
    const newValue = current ? current.value + 1 : 1;
    this.store.set(key, { value: newValue, ttl: current?.ttl });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const current = this.store.get(key);
    if (current) {
      this.store.set(key, { ...current, ttl: seconds });
      return 1;
    }
    return 0;
  }

  async ttl(key: string): Promise<number> {
    const current = this.store.get(key);
    return current?.ttl ?? -2;
  }

  async get(key: string): Promise<string | null> {
    const current = this.store.get(key);
    return current ? current.value.toString() : null;
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async quit(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }

  // Helper for testing
  clear() {
    this.store.clear();
  }
}

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let mockRedis: MockRedis;

  beforeEach(() => {
    mockRedis = new MockRedis();
    service = new RateLimiterService(
      { limit: 100, windowSeconds: 900 },
      mockRedis as unknown as Redis,
    );
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    mockRedis.clear();
  });

  describe('checkLimit', () => {
    it('should allow first request and set remaining to 99', async () => {
      const result = await service.checkLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
      expect(result.resetTime).toBeDefined();
    });

    it('should decrement remaining count on subsequent requests', async () => {
      await service.checkLimit('192.168.1.1');
      await service.checkLimit('192.168.1.1');
      const result = await service.checkLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(97);
    });

    it('should block requests after limit is exceeded', async () => {
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await service.checkLimit('192.168.1.1');
      }

      // 101st request should be blocked
      const result = await service.checkLimit('192.168.1.1');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle multiple IPs independently', async () => {
      await service.checkLimit('192.168.1.1');
      await service.checkLimit('192.168.1.1');

      const result1 = await service.checkLimit('192.168.1.1');
      const result2 = await service.checkLimit('192.168.1.2');

      expect(result1.remaining).toBe(97);
      expect(result2.remaining).toBe(99);
    });

    it('should set TTL on first request', async () => {
      await service.checkLimit('192.168.1.1');

      const ttl = await mockRedis.ttl('rate-limit:192.168.1.1');
      expect(ttl).toBe(900);
    });

    it('should fail open on Redis errors', async () => {
      // Create a service with a broken Redis client
      const brokenRedis = {
        incr: jest.fn().mockRejectedValue(new Error('Redis connection failed')),
        expire: jest.fn(),
        ttl: jest.fn(),
        quit: jest.fn(),
      };

      const errorService = new RateLimiterService(
        { limit: 100, windowSeconds: 900 },
        brokenRedis as unknown as Redis,
      );

      const result = await errorService.checkLimit('192.168.1.1');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(100);
    });
  });

  describe('reset', () => {
    it('should reset rate limit for an IP', async () => {
      await service.checkLimit('192.168.1.1');
      await service.checkLimit('192.168.1.1');

      await service.reset('192.168.1.1');

      const result = await service.checkLimit('192.168.1.1');
      expect(result.remaining).toBe(99);
    });
  });

  describe('getCount', () => {
    it('should return current count for an IP', async () => {
      await service.checkLimit('192.168.1.1');
      await service.checkLimit('192.168.1.1');
      await service.checkLimit('192.168.1.1');

      const count = await service.getCount('192.168.1.1');
      expect(count).toBe(3);
    });

    it('should return 0 for IP with no requests', async () => {
      const count = await service.getCount('192.168.1.1');
      expect(count).toBe(0);
    });
  });

  describe('custom configuration', () => {
    it('should respect custom limit', async () => {
      const customService = new RateLimiterService(
        { limit: 5, windowSeconds: 60 },
        mockRedis as unknown as Redis,
      );

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await customService.checkLimit('192.168.1.1');
      }

      // 6th request should be blocked
      const result = await customService.checkLimit('192.168.1.1');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });
});
