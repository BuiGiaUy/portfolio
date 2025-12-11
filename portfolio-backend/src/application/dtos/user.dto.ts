/**
 * Application Layer DTO
 *
 * DTOs are used to transfer data between layers.
 * They have no business logic and no dependencies.
 */
export class CreateUserDto {
  email!: string;
  name!: string;
  password!: string;
}

export class UpdateUserDto {
  name?: string;
  password?: string;
}

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
