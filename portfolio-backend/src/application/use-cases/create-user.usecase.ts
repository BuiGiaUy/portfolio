import { Inject, Injectable } from '@nestjs/common';
import * as userRepositoryInterface from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/user.dto';

/**
 * Application Layer Use Case
 *
 * This use case orchestrates business logic.
 * It depends ONLY on the domain layer (entities and repository interfaces).
 * It has NO knowledge of infrastructure implementation details.
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(userRepositoryInterface.USER_REPOSITORY)
    private readonly userRepository: userRepositoryInterface.IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user entity (domain logic)
    const user = new User(
      this.generateId(), // In real app, use UUID library
      dto.email,
      dto.name,
      this.hashPassword(dto.password), // In real app, use bcrypt
      new Date(),
      new Date(),
    );

    // Persist using repository
    return await this.userRepository.save(user);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(7);
  }

  private hashPassword(password: string): string {
    // In production, use bcrypt or similar
    return `hashed_${password}`;
  }
}
