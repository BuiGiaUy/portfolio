import { Test, TestingModule } from '@nestjs/testing';
import { IncrementProjectViewOptimisticUseCase } from '../../../src/application/use-cases/increment-project-view-optimistic.usecase';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../../src/domain/repositories/project.repository.interface';
import { ProjectNotFoundError } from '../../../src/application/errors/project-not-found.error';
import { VersionConflictError } from '../../../src/application/errors/version-conflict.error';

describe('IncrementProjectViewOptimisticUseCase', () => {
  let useCase: IncrementProjectViewOptimisticUseCase;
  let mockRepository: jest.Mocked<IProjectRepository>;

  beforeEach(async () => {
    // Create mock repository with all required methods
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updateProjectDetails: jest.fn(),
      incrementViewPessimistic: jest.fn(),
      incrementViewOptimistic: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncrementProjectViewOptimisticUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<IncrementProjectViewOptimisticUseCase>(
      IncrementProjectViewOptimisticUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully increment views with optimistic locking', async () => {
      // Arrange
      const projectId = 'project-123';
      mockRepository.incrementViewOptimistic.mockResolvedValue(undefined);

      // Act
      await useCase.execute(projectId);

      // Assert
      expect(mockRepository.incrementViewOptimistic).toHaveBeenCalledTimes(1);
      expect(mockRepository.incrementViewOptimistic).toHaveBeenCalledWith(
        projectId,
      );
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      // Arrange
      const projectId = 'nonexistent-project';
      const error = new ProjectNotFoundError(projectId);
      mockRepository.incrementViewOptimistic.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(projectId)).rejects.toThrow(
        ProjectNotFoundError,
      );
      await expect(useCase.execute(projectId)).rejects.toThrow(
        `Project with ID ${projectId} not found`,
      );

      expect(mockRepository.incrementViewOptimistic).toHaveBeenCalledWith(
        projectId,
      );
    });

    it('should throw VersionConflictError after max retries', async () => {
      // Arrange
      const projectId = 'project-123';
      const error = new VersionConflictError(
        projectId,
        'Failed to increment views after 3 attempts due to version conflicts',
      );
      mockRepository.incrementViewOptimistic.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(projectId)).rejects.toThrow(
        VersionConflictError,
      );
      await expect(useCase.execute(projectId)).rejects.toThrow(
        /Failed to increment views after 3 attempts/,
      );
    });

    it('should delegate all logic to repository', async () => {
      // Arrange
      const projectId = 'project-456';
      mockRepository.incrementViewOptimistic.mockResolvedValue(undefined);

      // Act
      await useCase.execute(projectId);

      // Assert
      // Verify use-case delegates to repository
      expect(mockRepository.incrementViewOptimistic).toHaveBeenCalledTimes(1);
      expect(mockRepository.incrementViewOptimistic).toHaveBeenCalledWith(
        projectId,
      );

      // Verify no other repository methods were called
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockRepository.updateProjectDetails).not.toHaveBeenCalled();
      expect(mockRepository.incrementViewPessimistic).not.toHaveBeenCalled();
    });

    it('should propagate any repository error', async () => {
      // Arrange
      const projectId = 'project-123';
      const genericError = new Error('Database connection failed');
      mockRepository.incrementViewOptimistic.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(projectId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('Clean Architecture Compliance', () => {
    it('should NOT depend on PrismaService', () => {
      // This is a meta-test to ensure Clean Architecture
      const useCaseInstance = new IncrementProjectViewOptimisticUseCase(
        mockRepository,
      );
      expect(useCaseInstance).toBeDefined();
      // If PrismaService was used, TypeScript would fail compilation
    });

    it('should depend ONLY on IProjectRepository', () => {
      // Verify constructor accepts IProjectRepository
      expect(
        () => new IncrementProjectViewOptimisticUseCase(mockRepository),
      ).not.toThrow();
    });
  });
});
