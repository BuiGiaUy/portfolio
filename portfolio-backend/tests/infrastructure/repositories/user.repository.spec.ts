import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from 'src/infrastructure/repositories/user.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { User } from 'src/domain/entities/user.entity';
import { UserPersistenceMapper } from 'src/infrastructure/mappers/user-persistence.mapper';
import { Role } from 'src/domain/enums/role.enum';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;

  // Mock Prisma data matching actual schema (no name field)
  const mockPrismaUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashed_password_123',
    role: 'VIEWER' as const,
    refreshTokenHash: null,
    active: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockDomainUser = new User(
    mockPrismaUser.id,
    mockPrismaUser.email,
    mockPrismaUser.passwordHash,
    Role.VIEWER,
    mockPrismaUser.refreshTokenHash,
    mockPrismaUser.active,
    mockPrismaUser.createdAt,
    mockPrismaUser.updatedAt,
  );

  beforeEach(async () => {
    // Create a mock PrismaService
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockPrismaUser);

      // Act
      const result = await repository.findById(mockPrismaUser.id);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockPrismaUser.id },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockPrismaUser.id);
      expect(result?.email).toBe(mockPrismaUser.email);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockPrismaUser);

      // Act
      const result = await repository.findByEmail(mockPrismaUser.email);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockPrismaUser.email },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(mockPrismaUser.email);
    });

    it('should return null when user is not found by email', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await repository.findByEmail('nonexistent@example.com');

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should create a new user when id does not exist', async () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'upsert')
        .mockResolvedValue(mockPrismaUser);

      // Act
      const result = await repository.save(mockDomainUser);

      // Assert
      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { id: mockDomainUser.id },
        update: {
          passwordHash: mockDomainUser.passwordHash,
          role: mockDomainUser.role,
          refreshTokenHash: mockDomainUser.refreshTokenHash,
          active: mockDomainUser.active,
          updatedAt: mockDomainUser.updatedAt,
        },
        create: {
          id: mockDomainUser.id,
          email: mockDomainUser.email,
          passwordHash: mockDomainUser.passwordHash,
          role: mockDomainUser.role,
          refreshTokenHash: mockDomainUser.refreshTokenHash,
          active: mockDomainUser.active,
          createdAt: mockDomainUser.createdAt,
          updatedAt: mockDomainUser.updatedAt,
        },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockPrismaUser.id);
    });

    it('should update an existing user', async () => {
      // Arrange
      const updatedPrismaUser = {
        ...mockPrismaUser,
        passwordHash: 'new_password_hash',
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      };
      const updatedDomainUser = new User(
        mockDomainUser.id,
        mockDomainUser.email,
        'new_password_hash',
        mockDomainUser.role,
        mockDomainUser.refreshTokenHash,
        mockDomainUser.active,
        mockDomainUser.createdAt,
        new Date('2024-01-02T00:00:00Z'),
      );

      jest
        .spyOn(prismaService.user, 'upsert')
        .mockResolvedValue(updatedPrismaUser);

      // Act
      const result = await repository.save(updatedDomainUser);

      // Assert
      expect(prismaService.user.upsert).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result.passwordHash).toBe('new_password_hash');
    });

    it('should return a User domain entity', async () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'upsert')
        .mockResolvedValue(mockPrismaUser);

      // Act
      const result = await repository.save(mockDomainUser);

      // Assert
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'delete')
        .mockResolvedValue(mockPrismaUser);

      // Act
      await repository.delete(mockPrismaUser.id);

      // Assert
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: mockPrismaUser.id },
      });
    });

    it('should not throw when deleting non-existent user', async () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'delete')
        .mockResolvedValue(mockPrismaUser);

      // Act & Assert
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        mockPrismaUser,
        {
          ...mockPrismaUser,
          id: '223e4567-e89b-12d3-a456-426614174001',
          email: 'test2@example.com',
        },
      ];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[1]).toBeInstanceOf(User);
    });

    it('should return an empty array when no users exist', async () => {
      // Arrange
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('UserMapper integration', () => {
    it('should use UserMapper.toDomain for single user', async () => {
      // Arrange
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(mockPrismaUser);
      const toDomainSpy = jest.spyOn(UserPersistenceMapper, 'toDomain');

      // Act
      await repository.findById(mockPrismaUser.id);

      // Assert
      expect(toDomainSpy).toHaveBeenCalledWith(mockPrismaUser);
    });

    it('should use UserMapper.toDomainList for multiple users', async () => {
      // Arrange
      const mockUsers = [mockPrismaUser];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);
      const toDomainListSpy = jest.spyOn(UserPersistenceMapper, 'toDomainList');

      // Act
      await repository.findAll();

      // Assert
      expect(toDomainListSpy).toHaveBeenCalledWith(mockUsers);
    });
  });
});
