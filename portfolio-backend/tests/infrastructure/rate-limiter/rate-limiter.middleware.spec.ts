import { RateLimiterMiddleware } from '../../../src/infrastructure/rate-limiter/rate-limiter.middleware';
import { RateLimiterService } from '../../../src/infrastructure/rate-limiter/rate-limiter.service';
import { Request, Response } from 'express';

describe('RateLimiterMiddleware', () => {
  let middleware: RateLimiterMiddleware;
  let mockService: jest.Mocked<RateLimiterService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // Mock RateLimiterService
    mockService = {
      checkLimit: jest.fn(),
    } as unknown as jest.Mocked<RateLimiterService>;

    middleware = new RateLimiterMiddleware(mockService);

    // Mock Express Request
    mockRequest = {
      socket: {
        remoteAddress: '192.168.1.1',
      } as any,
      headers: {},
    };

    // Mock Express Response
    mockResponse = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    nextFunction = jest.fn();
  });

  describe('use', () => {
    it('should allow request when under limit', async () => {
      mockService.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 95,
        resetTime: Date.now() + 900000,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '95');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(String),
      );
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should block request when limit exceeded', async () => {
      mockService.checkLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 900000,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Too many requests, please try again later.',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should extract IP from X-Forwarded-For header', async () => {
      mockRequest.headers = {
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
      };

      mockService.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 99,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockService.checkLimit).toHaveBeenCalledWith('203.0.113.1');
    });

    it('should extract IP from X-Real-IP header', async () => {
      mockRequest.headers = {
        'x-real-ip': '203.0.113.5',
      };

      mockService.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 99,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockService.checkLimit).toHaveBeenCalledWith('203.0.113.5');
    });

    it('should fallback to socket remote address', async () => {
      mockRequest.socket = {
        remoteAddress: '192.168.1.100',
      } as any;

      mockService.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 99,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockService.checkLimit).toHaveBeenCalledWith('192.168.1.100');
    });

    it('should handle missing reset time', async () => {
      mockService.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 50,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '50');
      expect(mockResponse.setHeader).toHaveBeenCalledTimes(2); // Only 2 headers, no reset time
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should set rate limit headers correctly', async () => {
      const resetTime = Date.now() + 600000; // 10 minutes from now
      mockService.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 42,
        resetTime,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '100');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '42');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        Math.floor(resetTime / 1000).toString(),
      );
    });

    it('should handle array X-Forwarded-For header', async () => {
      mockRequest.headers = {
        'x-forwarded-for': ['203.0.113.1, 198.51.100.1', '192.0.2.1'],
      };

      mockService.checkLimit.mockResolvedValue({
        allowed: true,
        remaining: 99,
      });

      await middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockService.checkLimit).toHaveBeenCalledWith('203.0.113.1');
    });
  });
});
