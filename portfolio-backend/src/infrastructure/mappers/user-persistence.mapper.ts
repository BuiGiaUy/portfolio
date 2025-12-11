import type { Prisma } from '../../generated/prisma/client/client';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/role.enum';

/**
 * Mapper for User entity
 * Handles transformations between Domain and Persistence layers
 * Follows the Dependency Inversion Principle
 */
export class UserPersistenceMapper {
  /**
   * Convert Prisma User model to Domain User entity
   * @param prismaUser - The Prisma user object from database
   * @returns Domain User entity
   */
  static toDomain(prismaUser: Prisma.UserGetPayload<object>): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.role as Role,
      prismaUser.refreshTokenHash,
      prismaUser.active,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  /**
   * Convert Domain User entity to Prisma persistence format
   * @param user - The Domain user entity
   * @returns Prisma-compatible user object
   */
  static toPersistence(user: User): {
    id: string;
    email: string;
    passwordHash: string;
    role: Role;
    refreshTokenHash: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      refreshTokenHash: user.refreshTokenHash,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convert an array of Prisma users to Domain entities
   * @param prismaUsers - Array of Prisma user objects
   * @returns Array of Domain User entities
   */
  static toDomainList(prismaUsers: Prisma.UserGetPayload<object>[]): User[] {
    return prismaUsers.map((user) => this.toDomain(user));
  }
}
