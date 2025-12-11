import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPOSITORY,
} from '../../../domain/repositories/user.repository.interface';
import { Role } from '../../../domain/enums/role.enum';

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Return user data without sensitive fields
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
