import { User } from '../entities/user.entity';

/**
 * Domain Repository Interface
 *
 * This interface defines the contract for user persistence.
 * It belongs to the DOMAIN layer and has NO dependencies on infrastructure.
 *
 * The infrastructure layer will implement this interface.
 * This follows the Dependency Inversion Principle (DIP).
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  updateRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void>;
}

/**
 * Injection token for dependency injection
 * This allows us to inject the repository implementation without coupling to it
 */
export const USER_REPOSITORY = Symbol('IUserRepository');
