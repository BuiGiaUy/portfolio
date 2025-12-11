import { User } from 'src/domain/entities/user.entity';

describe('User Entity', () => {
  const validUserData = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'John Doe',
    passwordHash: 'hashed_password_123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('Constructor Validation', () => {
    it('should create a valid user', () => {
      // Act
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Assert
      expect(user.id).toBe(validUserData.id);
      expect(user.email).toBe(validUserData.email);
      expect(user.name).toBe(validUserData.name);
      expect(user.passwordHash).toBe(validUserData.passwordHash);
      expect(user.createdAt).toBe(validUserData.createdAt);
      expect(user.updatedAt).toBe(validUserData.updatedAt);
    });

    it('should throw error when id is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          '',
          validUserData.email,
          validUserData.name,
          validUserData.passwordHash,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User ID is required');
    });

    it('should throw error when email is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          '',
          validUserData.name,
          validUserData.passwordHash,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User email is required');
    });

    it('should throw error when email format is invalid', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          'invalid-email',
          validUserData.name,
          validUserData.passwordHash,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('Invalid email format');
    });

    it('should throw error when name is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          '',
          validUserData.passwordHash,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User name is required');
    });

    it('should throw error when name is too short', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          'J',
          validUserData.passwordHash,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User name must be at least 2 characters long');
    });

    it('should throw error when passwordHash is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          validUserData.name,
          '',
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User password hash is required');
    });

    it('should throw error when createdAt is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          validUserData.name,
          validUserData.passwordHash,
          null as any,
          validUserData.updatedAt,
        );
      }).toThrow('User creation date is required');
    });

    it('should throw error when updatedAt is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          validUserData.name,
          validUserData.passwordHash,
          validUserData.createdAt,
          null as any,
        );
      }).toThrow('User update date is required');
    });
  });

  describe('updateProfile', () => {
    it('should update name and timestamp when valid', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );
      const originalUpdatedAt = user.updatedAt;
      const newName = 'Jane Smith';

      // Wait to ensure timestamp changes
      setTimeout(() => {}, 1);

      // Act
      user.updateProfile(newName);

      // Assert
      expect(user.name).toBe(newName);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when name is too short', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        user.updateProfile('J');
      }).toThrow('User name must be at least 2 characters long');
    });

    it('should throw error when name is empty', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        user.updateProfile('');
      }).toThrow('User name must be at least 2 characters long');
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password hash matches', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Act
      const result = user.verifyPassword(validUserData.passwordHash);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when password hash does not match', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Act
      const result = user.verifyPassword('wrong_hash');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should update password hash and timestamp when valid', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );
      const originalUpdatedAt = user.updatedAt;
      const newPasswordHash = 'new_hashed_password_456';

      // Wait to ensure timestamp changes
      setTimeout(() => {}, 1);

      // Act
      user.changePassword(newPasswordHash);

      // Assert
      expect(user.passwordHash).toBe(newPasswordHash);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should throw error when new password hash is empty', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.name,
        validUserData.passwordHash,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Act & Assert
      expect(() => {
        user.changePassword('');
      }).toThrow('User password hash is required');
    });
  });
});
