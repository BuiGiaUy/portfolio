import { Inject, Injectable } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    // Clear refresh token from database
    await this.userRepository.updateRefreshToken(userId, null);
  }
}
