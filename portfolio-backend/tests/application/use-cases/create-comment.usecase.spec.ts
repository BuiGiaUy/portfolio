import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommentUseCase } from 'src/application/use-cases/create-comment.usecase';
import {
  ICommentRepository,
  COMMENT_REPOSITORY,
} from 'src/domain/repositories/comment.repository.interface';
import { Comment } from 'src/domain/entities/comment.entity';
import { CreateCommentDto } from 'src/application/dtos/comment.dto';

describe('CreateCommentUseCase', () => {
  let useCase: CreateCommentUseCase;
  let mockRepository: jest.Mocked<ICommentRepository>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findByProjectId: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommentUseCase,
        {
          provide: COMMENT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateCommentUseCase>(CreateCommentUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createCommentDto: CreateCommentDto = {
      content: 'This is a test comment',
      userId: 'user-123',
      projectId: 'project-123',
    };

    it('should create a new comment successfully', async () => {
      // Arrange
      mockRepository.save.mockImplementation((comment) =>
        Promise.resolve(comment),
      );

      // Act
      const result = await useCase.execute(createCommentDto);

      // Assert
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Comment);
      expect(result.content).toBe(createCommentDto.content);
      expect(result.userId).toBe(createCommentDto.userId);
      expect(result.projectId).toBe(createCommentDto.projectId);
    });

    it('should generate an id for the new comment', async () => {
      // Arrange
      mockRepository.save.mockImplementation((comment) =>
        Promise.resolve(comment),
      );

      // Act
      const result = await useCase.execute(createCommentDto);

      // Assert
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      // Arrange
      mockRepository.save.mockImplementation((comment) =>
        Promise.resolve(comment),
      );
      const beforeExecution = new Date();

      // Act
      const result = await useCase.execute(createCommentDto);

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

    it('should call repository save with created comment', async () => {
      // Arrange
      mockRepository.save.mockImplementation((comment) =>
        Promise.resolve(comment),
      );

      // Act
      await useCase.execute(createCommentDto);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const savedComment = mockRepository.save.mock.calls[0][0];
      expect(savedComment).toBeInstanceOf(Comment);
      expect(savedComment.content).toBe(createCommentDto.content);
      expect(savedComment.userId).toBe(createCommentDto.userId);
      expect(savedComment.projectId).toBe(createCommentDto.projectId);
    });

    it('should throw error when content is empty (entity validation)', async () => {
      // Arrange
      const invalidDto: CreateCommentDto = {
        content: '', // Empty
        userId: 'user-123',
        projectId: 'project-123',
      };
      mockRepository.save.mockImplementation((comment) =>
        Promise.resolve(comment),
      );

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        'Comment content is required',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when content exceeds 500 characters (entity validation)', async () => {
      // Arrange
      const invalidDto: CreateCommentDto = {
        content: 'A'.repeat(501), // Too long
        userId: 'user-123',
        projectId: 'project-123',
      };
      mockRepository.save.mockImplementation((comment) =>
        Promise.resolve(comment),
      );

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        'Comment content must not exceed 500 characters',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should accept comment with exactly 500 characters (boundary)', async () => {
      // Arrange
      const boundaryDto: CreateCommentDto = {
        content: 'A'.repeat(500), // Exactly 500
        userId: 'user-123',
        projectId: 'project-123',
      };
      mockRepository.save.mockImplementation((comment) =>
        Promise.resolve(comment),
      );

      // Act
      const result = await useCase.execute(boundaryDto);

      // Assert
      expect(result.content).toBe(boundaryDto.content);
      expect(result.content.length).toBe(500);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
