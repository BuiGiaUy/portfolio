import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from './rate-limiter.service';

/**
 * Rate Limiter Middleware
 * 
 * Applies rate limiting to incoming HTTP requests based on client IP.
 * Returns 429 Too Many Requests when limit is exceeded.
 * 
 * Headers added to response:
 * - X-RateLimit-Limit: Maximum requests allowed in the window
 * - X-RateLimit-Remaining: Remaining requests in current window
 * - X-RateLimit-Reset: Unix timestamp when the limit resets
 */

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract client IP address
    const ip = this.getClientIp(req);

    // Check rate limit
    const result = await this.rateLimiterService.checkLimit(ip);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    
    if (result.resetTime) {
      res.setHeader('X-RateLimit-Reset', Math.floor(result.resetTime / 1000).toString());
    }

    // If limit exceeded, return 429
    if (!result.allowed) {
      return res.status(429).json({
        message: 'Too many requests, please try again later.',
      });
    }

    // Continue to next middleware/controller
    next();
  }

  /**
   * Extract client IP from request
   * Handles various proxy scenarios (X-Forwarded-For, X-Real-IP)
   */
  private getClientIp(req: Request): string {
    // Check X-Forwarded-For header (common with proxies/load balancers)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
      return ips.split(',')[0].trim();
    }

    // Check X-Real-IP header
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to socket remote address
    return req.socket.remoteAddress || 'unknown';
  }
}
