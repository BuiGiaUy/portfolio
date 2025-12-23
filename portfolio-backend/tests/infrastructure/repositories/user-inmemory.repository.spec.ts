import { UserInMemoryRepository } from 'src/infrastructure/repositories/user-inmemory.repository';
import { User } from 'src/domain/entities/user.entity';
import { Role } from 'src/domain/enums/role.enum';

describe('UserInMemoryRepository', () => {
  let repository: UserInMemoryRepository;

  // Mock data matching actual User entity structure
  const mockUser = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'hashed_password_123',
    Role.VIEWER,
    null,
    true,
    new Date('2024-01-01T00:00:00Z'),
    new Date('2024-01-01T00:00:00Z'),
  );

  const mockUser2 = new User(
    '223e4567-e89b-12d3-a456-426614174001',
    'test2@example.com',
    'hashed_password_456',
    Role.OWNER,
    'refresh_token_hash',
    true,
    new Date('2024-01-02T00:00:00Z'),
    new Date('2024-01-02T00:00:00Z'),
  );

  beforeEach(() => {
    repository = new UserInMemoryRepository();
  });

  describe('save', () => {
    it('should save a new user', async () => {
      // Act
      const result = await repository.save(mockUser);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should update an existing user', async () => {
      // Arrange
      await repository.save(mockUser);
      const updatedUser = new User(
        mockUser.id,
        mockUser.email,
        'new_password_hash',
        mockUser.role,
        'new_refresh_token',
        mockUser.active,
        mockUser.createdAt,
        new Date('2024-01-03T00:00:00Z'),
      );

      // Act
      const result = await repository.save(updatedUser);

      // Assert
      expect(result.passwordHash).toBe('new_password_hash');
      expect(result.refreshTokenHash).toBe('new_refresh_token');
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      // Arrange
      await repository.save(mockUser);

      // Act
      const result = await repository.findById(mockUser.id);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(mockUser.id);
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null when user is not found', async () => {
      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      // Arrange
      await repository.save(mockUser);

      // Act
      const result = await repository.findByEmail(mockUser.email);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null when user is not found by email', async () => {
      // Act
      const result = await repository.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      await repository.save(mockUser);
      await repository.save(mockUser2);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[1]).toBeInstanceOf(User);
    });

    it('should return an empty array when no users exist', async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete a user by id', async () => {
      // Arrange
      await repository.save(mockUser);

      // Act
      await repository.delete(mockUser.id);
      const result = await repository.findById(mockUser.id);

      // Assert
      expect(result).toBeNull();
    });

    it('should not throw when deleting non-existent user', async () => {
      // Act & Assert
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });
});
