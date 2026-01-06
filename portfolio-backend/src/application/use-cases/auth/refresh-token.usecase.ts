import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { AuthResponseDto } from '../../dto/auth/auth-response.dto';
import { JwtPayload } from 'src/infrastructure/auth/strategies/jwt.strategy';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ authResponse: AuthResponseDto; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      // Find user
      const user = await this.userRepository.findById(payload.sub);

      if (!user || !user.active) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Verify stored refresh token hash
      if (!user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new token pair
      const newPayload = { sub: user.id, email: user.email, role: user.role };

      const accessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      });

      // Rotate refresh token (invalidate old, store new)
      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
      await this.userRepository.updateRefreshToken(
        user.id,
        newRefreshTokenHash,
      );

      // Return response
      const authResponse = new AuthResponseDto(accessToken, {
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return { authResponse, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
