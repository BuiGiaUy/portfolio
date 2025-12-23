import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from 'src/application/use-cases/create-user.usecase';
import {
  IUserRepository,
  USER_REPOSITORY,
} from 'src/domain/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user.entity';
import { CreateUserDto } from 'src/application/dtos/user.dto';

import { Role } from 'src/domain/enums/role.enum';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe(createUserDto.email);
      // Note: User entity doesn't have name field - name is generated from email in DTOs
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const existingUser = new User(
        '123',
        createUserDto.email,
        'hash',
        Role.VIEWER,
        null,
        true,
        new Date(),
        new Date(),
      );
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'User with this email already exists',
      );
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should hash the password', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      expect(result.verifyPassword(`hashed_${createUserDto.password}`)).toBe(
        true,
      );
      expect(result.verifyPassword(createUserDto.password)).toBe(false);
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));
      const beforeExecution = new Date();

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      const afterExecution = new Date();
      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeExecution.getTime(),
      );
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(
        afterExecution.getTime(),
      );
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeExecution.getTime(),
      );
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(
        afterExecution.getTime(),
      );
    });

    it('should generate a unique ID', async () => {
      // Arrange
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });
  });
});
