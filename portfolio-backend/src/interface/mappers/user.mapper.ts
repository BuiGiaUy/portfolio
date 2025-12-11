import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../../application/dtos/user.dto';

/**
 * Mapper: Domain Entity to DTO
 *
 * Mappers convert between domain entities and DTOs.
 * This keeps the domain layer clean and prevents exposing internal details.
 */
export class UserMapper {
  static toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDtoArray(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toDto(user));
  }
}
