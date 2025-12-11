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
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LoginDto } from '../../../application/dto/auth/login.dto';
import { LoginUseCase } from '../../../application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.usecase';
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.usecase';
import { GetMeUseCase } from '../../../application/use-cases/auth/get-me.usecase';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../infrastructure/auth/decorators/current-user.decorator';
import { RequestUser } from '../../../infrastructure/auth/strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
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

    // Set refresh token as HttpOnly cookie
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return authResponse;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const { authResponse, refreshToken: newRefreshToken } =
      await this.refreshTokenUseCase.execute(refreshToken);

    // Rotate refresh token
    response.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return authResponse;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.logoutUseCase.execute(user.userId);

    // Clear refresh token cookie
    response.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: RequestUser) {
    return this.getMeUseCase.execute(user.userId);
  }
}
