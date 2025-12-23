import { User } from 'src/domain/entities/user.entity';
import { Role } from 'src/domain/enums/role.enum';

describe('User Entity', () => {
  const validUserData = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed_password_123',
    role: Role.VIEWER,
    refreshTokenHash: null,
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  describe('Constructor Validation', () => {
    it('should create a valid user', () => {
      // Act
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        validUserData.active,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Assert
      expect(user.id).toBe(validUserData.id);
      expect(user.email).toBe(validUserData.email);
      expect(user.passwordHash).toBe(validUserData.passwordHash);
      expect(user.role).toBe(validUserData.role);
      expect(user.active).toBe(validUserData.active);
      expect(user.createdAt).toBe(validUserData.createdAt);
      expect(user.updatedAt).toBe(validUserData.updatedAt);
    });

    it('should throw error when id is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          '',
          validUserData.email,
          validUserData.passwordHash,
          validUserData.role,
          validUserData.refreshTokenHash,
          validUserData.active,
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
          validUserData.passwordHash,
          validUserData.role,
          validUserData.refreshTokenHash,
          validUserData.active,
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
          validUserData.passwordHash,
          validUserData.role,
          validUserData.refreshTokenHash,
          validUserData.active,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('Invalid email format');
    });

    it('should throw error when passwordHash is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          '',
          validUserData.role,
          validUserData.refreshTokenHash,
          validUserData.active,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User password hash is required');
    });

    it('should throw error when role is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          validUserData.passwordHash,
          null as any,
          validUserData.refreshTokenHash,
          validUserData.active,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User role is required');
    });

    it('should throw error when active status is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          validUserData.passwordHash,
          validUserData.role,
          validUserData.refreshTokenHash,
          null as any,
          validUserData.createdAt,
          validUserData.updatedAt,
        );
      }).toThrow('User active status is required');
    });

    it('should throw error when createdAt is missing', () => {
      // Act & Assert
      expect(() => {
        new User(
          validUserData.id,
          validUserData.email,
          validUserData.passwordHash,
          validUserData.role,
          validUserData.refreshTokenHash,
          validUserData.active,
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
          validUserData.passwordHash,
          validUserData.role,
          validUserData.refreshTokenHash,
          validUserData.active,
          validUserData.createdAt,
          null as any,
        );
      }).toThrow('User update date is required');
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token and timestamp', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        validUserData.active,
        validUserData.createdAt,
        validUserData.updatedAt,
      );
      const originalUpdatedAt = user.updatedAt;
      const newRefreshTokenHash = 'new_refresh_token_hash';

      // Wait to ensure timestamp changes
      setTimeout(() => {}, 1);

      // Act
      user.updateRefreshToken(newRefreshTokenHash);

      // Assert
      expect(user.refreshTokenHash).toBe(newRefreshTokenHash);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('activate and deactivate', () => {
    it('should deactivate user', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        true,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Act
      user.deactivate();

      // Assert
      expect(user.active).toBe(false);
    });

    it('should activate user', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        false,
        validUserData.createdAt,
        validUserData.updatedAt,
      );

      // Act
      user.activate();

      // Assert
      expect(user.active).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password hash matches', () => {
      // Arrange
      const user = new User(
        validUserData.id,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        validUserData.active,
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
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        validUserData.active,
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
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        validUserData.active,
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
        validUserData.passwordHash,
        validUserData.role,
        validUserData.refreshTokenHash,
        validUserData.active,
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
