import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.usecase';
import {
  CreateUserDto,
  UserResponseDto,
} from '../../application/dtos/user.dto';
import { UserMapper } from '../mappers/user.mapper';

/**
 * User Controller
 *
 * Interface layer controller handling HTTP requests for user resources.
 * Delegates business logic to use cases and maps responses to DTOs.
 */
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return UserMapper.toDto(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string): UserResponseDto {
    // This would require a GetUserByIdUseCase
    // For now, returning a placeholder
    return {
      id,
      email: 'placeholder@example.com',
      name: 'Placeholder',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
