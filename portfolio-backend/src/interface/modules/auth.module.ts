import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../controllers/auth.controller';
import { LoginUseCase } from '../../application/use-cases/auth/login.usecase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.usecase';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.usecase';
import { GetMeUseCase } from '../../application/use-cases/auth/get-me.usecase';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { PrismaUserRepository } from '../../infrastructure/repositories/user.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Use cases
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    // Strategy
    JwtStrategy,
    // Repository
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    // Database
    PrismaService,
  ],
  exports: [JwtStrategy, JwtModule],
})
export class AuthModule {}
