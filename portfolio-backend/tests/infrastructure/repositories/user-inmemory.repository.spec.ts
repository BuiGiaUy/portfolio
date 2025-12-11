import { UserInMemoryRepository } from 'src/infrastructure/repositories/user-inmemory.repository';
import { User } from 'src/domain/entities/user.entity';

describe('UserInMemoryRepository', () => {
  let repository: UserInMemoryRepository;

  beforeEach(() => {
    repository = new UserInMemoryRepository();
  });

  describe('save', () => {
    it('should save a user', async () => {
      const user = new User(
        '123',
        'test@example.com',
        'Test User',
        'hash',
        new Date(),
        new Date(),
      );

      const result = await repository.save(user);

      expect(result).toBe(user);
    });

    it('should update an existing user', async () => {
      const user = new User(
        '123',
        'test@example.com',
        'Test User',
        'hash',
        new Date(),
        new Date(),
      );

      await repository.save(user);
      user.updateProfile('Updated Name');
      const updated = await repository.save(user);

      expect(updated.name).toBe('Updated Name');
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = new User(
        '123',
        'test@example.com',
        'Test User',
        'hash',
        new Date(),
        new Date(),
      );
      await repository.save(user);

      const result = await repository.findById('123');

      expect(result).toBe(user);
      expect(result?.id).toBe('123');
    });

    it('should return null if user not found', async () => {
      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = new User(
        '123',
        'test@example.com',
        'Test User',
        'hash',
        new Date(),
        new Date(),
      );
      await repository.save(user);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBe(user);
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = new User(
        '123',
        'test@example.com',
        'Test User',
        'hash',
        new Date(),
        new Date(),
      );
      await repository.save(user);

      await repository.delete('123');
      const result = await repository.findById('123');

      expect(result).toBeNull();
    });

    it('should not throw error when deleting non-existent user', async () => {
      await expect(repository.delete('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const user1 = new User(
        '1',
        'user1@example.com',
        'User 1',
        'hash',
        new Date(),
        new Date(),
      );
      const user2 = new User(
        '2',
        'user2@example.com',
        'User 2',
        'hash',
        new Date(),
        new Date(),
      );

      await repository.save(user1);
      await repository.save(user2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(user1);
      expect(result).toContain(user2);
    });

    it('should return empty array when no users', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });
});
