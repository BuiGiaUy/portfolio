import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginDto } from 'src/application/dto/auth/login.dto';
import { LoginUseCase } from 'src/application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from 'src/application/use-cases/auth/refresh-token.usecase';
import { LogoutUseCase } from 'src/application/use-cases/auth/logout.usecase';
import { GetMeUseCase } from 'src/application/use-cases/auth/get-me.usecase';
import { JwtAuthGuard } from 'src/infrastructure/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/infrastructure/auth/decorators/current-user.decorator';
import { RequestUser } from 'src/infrastructure/auth/strategies/jwt.strategy';
import { StructuredLogger } from 'src/infrastructure/logging/structured-logger.service';
import {
  setSentryUser,
  clearSentryUser,
} from 'src/infrastructure/observability/sentry.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly logger: StructuredLogger,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { authResponse, refreshToken } = await this.loginUseCase.execute(
      loginDto.email,
      loginDto.password,
    );

    // Set access token as HttpOnly cookie (for server-side middleware)
    response.cookie('accessToken', authResponse.accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite:
        (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes (same as JWT expiry)
    });

    // Set refresh token as HttpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite:
        (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log successful login (no PII)
    this.logger.logWithMetadata(
      'User logged in successfully',
      {
        userId: authResponse.user.id,
        email: authResponse.user.email,
      },
      'AuthController',
    );

    // Set Sentry user context
    setSentryUser(authResponse.user.id);

    return authResponse;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      this.logger.warn('Refresh token not found in cookies');
      throw new UnauthorizedException(
        'Refresh token not found. Please login again.',
      );
    }

    const { authResponse, refreshToken: newRefreshToken } =
      await this.refreshTokenUseCase.execute(refreshToken);

    // Set new access token as HttpOnly cookie
    response.cookie('accessToken', authResponse.accessToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite:
        (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Rotate refresh token
    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite:
        (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    this.logger.logWithMetadata(
      'Token refreshed successfully',
      {
        userId: authResponse.user.id,
      },
      'AuthController',
    );

    return authResponse;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Try to get userId from refresh token (if available)
    // Logout should work even if access token is expired
    const refreshToken = request.cookies?.refreshToken as string | undefined;

    if (refreshToken) {
      try {
        // Extract userId from refresh token to invalidate it in database
        const decoded = this.decodeToken(refreshToken);
        await this.logoutUseCase.execute(decoded.sub);

        this.logger.logWithMetadata(
          'User logged out successfully',
          {
            userId: decoded.sub,
          },
          'AuthController',
        );

        // Clear Sentry user context
        clearSentryUser();
      } catch {
        this.logger.warn(
          'Could not decode token during logout, clearing cookies anyway',
        );
      }
    }

    // Cookie options must match EXACTLY with the options used when setting cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite:
        (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
      path: '/',
    };

    // Clear both cookies (always, even if token is invalid)
    response.clearCookie('accessToken', cookieOptions);
    response.clearCookie('refreshToken', cookieOptions);

    return {
      message: 'Logged out successfully',
      cleared: ['accessToken', 'refreshToken'],
    };
  }

  /**
   * Helper to decode JWT token without verification
   * Used for logout to extract userId even from expired tokens
   */
  private decodeToken(token: string): { sub: string; email: string } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload) as { sub: string; email: string };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: RequestUser) {
    return this.getMeUseCase.execute(user.userId);
  }
}
