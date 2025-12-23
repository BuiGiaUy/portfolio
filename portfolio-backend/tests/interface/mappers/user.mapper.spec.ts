import { UserMapper } from 'src/interface/mappers/user.mapper';
import { User } from 'src/domain/entities/user.entity';
import { Role } from 'src/domain/enums/role.enum';

describe('UserMapper', () => {
  const mockDate = new Date('2024-01-01');
  let user: User;

  beforeEach(() => {
    user = new User(
      '123',
      'test@example.com',
      'hashed_password',
      Role.VIEWER,
      null, // refreshTokenHash
      true, // active
      mockDate,
      mockDate,
    );
  });

  describe('toDto', () => {
    it('should map user entity to DTO', () => {
      const dto = UserMapper.toDto(user);

      expect(dto).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'test', // Generated from email (test@example.com -> test)
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should not include password hash in DTO', () => {
      const dto = UserMapper.toDto(user);

      expect(dto).not.toHaveProperty('passwordHash');
    });

    it('should include all required fields', () => {
      const dto = UserMapper.toDto(user);

      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('email');
      expect(dto).toHaveProperty('name');
      expect(dto).toHaveProperty('createdAt');
      expect(dto).toHaveProperty('updatedAt');
    });
  });

  describe('toDtoArray', () => {
    it('should map array of users to array of DTOs', () => {
      const user2 = new User(
        '456',
        'test2@example.com',
        'hash2',
        Role.VIEWER,
        null,
        true,
        mockDate,
        mockDate,
      );

      const dtos = UserMapper.toDtoArray([user, user2]);

      expect(dtos).toHaveLength(2);
      expect(dtos[0].id).toBe('123');
      expect(dtos[1].id).toBe('456');
    });

    it('should return empty array for empty input', () => {
      const dtos = UserMapper.toDtoArray([]);

      expect(dtos).toEqual([]);
    });
  });
});
