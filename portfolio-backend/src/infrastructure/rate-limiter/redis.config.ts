import Redis, { type Redis as RedisClient } from 'ioredis';

/**
 * Redis Configuration
 *
 * Provides a singleton Redis client instance for the application.
 * Configuration can be customized via environment variables.
 */

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

/**
 * Get Redis configuration from environment variables
 */
export const getRedisConfig = (): RedisConfig => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
});

/**
 * Create a new Redis client instance
 */
export const createRedisClient = (): RedisClient => {
  const config = getRedisConfig();

  const client = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.db,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  return client;
};
