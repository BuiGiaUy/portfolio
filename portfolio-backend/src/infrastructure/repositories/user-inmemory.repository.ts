import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

/**
 * Infrastructure Layer: Repository Implementation
 *
 * This class implements the domain repository interface.
 * It contains infrastructure-specific code (database access).
 *
 * IMPORTANT: The domain layer does NOT depend on this class.
 * Instead, this class depends on the domain interface (Dependency Inversion).
 */
@Injectable()
export class UserInMemoryRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.get(id) || null);
  }

  findByEmail(email: string): Promise<User | null> {
    const users = Array.from(this.users.values());
    return Promise.resolve(users.find((user) => user.email === email) || null);
  }

  save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return Promise.resolve(user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
    return Promise.resolve();
  }

  findAll(): Promise<User[]> {
    return Promise.resolve(Array.from(this.users.values()));
  }

  async updateRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
    const user = await this.findById(userId);
    if (user) {
      user.updateRefreshToken(refreshTokenHash);
      await this.save(user);
    }
  }
}
