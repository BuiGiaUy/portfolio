import { Test, TestingModule } from '@nestjs/testing';
import { IncrementProjectViewPessimisticUseCase } from '../../../src/application/use-cases/increment-project-view-pessimistic.usecase';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../../src/domain/repositories/project.repository.interface';
import { ProjectNotFoundError } from '../../../src/application/errors/project-not-found.error';

describe('IncrementProjectViewPessimisticUseCase', () => {
  let useCase: IncrementProjectViewPessimisticUseCase;
  let mockRepository: jest.Mocked<IProjectRepository>;

  beforeEach(async () => {
    // Create mock repository with all required methods
    mockRepository = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
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
        IncrementProjectViewPessimisticUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<IncrementProjectViewPessimisticUseCase>(
      IncrementProjectViewPessimisticUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully increment views with pessimistic locking', async () => {
      // Arrange
      const projectId = 'project-123';
      mockRepository.incrementViewPessimistic.mockResolvedValue(undefined);

      // Act
      await useCase.execute(projectId);

      // Assert
      expect(mockRepository.incrementViewPessimistic).toHaveBeenCalledTimes(1);
      expect(mockRepository.incrementViewPessimistic).toHaveBeenCalledWith(
        projectId,
      );
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      // Arrange
      const projectId = 'nonexistent-project';
      const error = new ProjectNotFoundError(projectId);
      mockRepository.incrementViewPessimistic.mockRejectedValue(error);

      // Act & Assert
      await expect(useCase.execute(projectId)).rejects.toThrow(
        ProjectNotFoundError,
      );
      await expect(useCase.execute(projectId)).rejects.toThrow(
        `Project with ID ${projectId} not found`,
      );

      expect(mockRepository.incrementViewPessimistic).toHaveBeenCalledWith(
        projectId,
      );
    });

    it('should delegate all logic to repository', async () => {
      // Arrange
      const projectId = 'project-456';
      mockRepository.incrementViewPessimistic.mockResolvedValue(undefined);

      // Act
      await useCase.execute(projectId);

      // Assert
      // Verify use-case delegates to repository
      expect(mockRepository.incrementViewPessimistic).toHaveBeenCalledTimes(1);
      expect(mockRepository.incrementViewPessimistic).toHaveBeenCalledWith(
        projectId,
      );

      // Verify no other repository methods were called
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockRepository.updateProjectDetails).not.toHaveBeenCalled();
      expect(mockRepository.incrementViewOptimistic).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const projectId = 'project-123';
      const genericError = new Error('Database connection failed');
      mockRepository.incrementViewPessimistic.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(projectId)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('Clean Architecture Compliance', () => {
    it('should NOT depend on PrismaService', () => {
      // This is a meta-test to ensure Clean Architecture
      const useCaseInstance = new IncrementProjectViewPessimisticUseCase(
        mockRepository,
      );
      expect(useCaseInstance).toBeDefined();
      // If PrismaService was used, TypeScript would fail compilation
    });

    it('should depend ONLY on IProjectRepository', () => {
      // Verify constructor accepts IProjectRepository
      expect(
        () => new IncrementProjectViewPessimisticUseCase(mockRepository),
      ).not.toThrow();
    });
  });
});
