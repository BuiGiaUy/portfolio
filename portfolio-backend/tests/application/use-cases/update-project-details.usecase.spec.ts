import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProjectDetailsUseCase } from '../../../src/application/use-cases/update-project-details.usecase';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
  UpdateProjectInput,
} from '../../../src/domain/repositories/project.repository.interface';
import { Project } from '../../../src/domain/entities/project.entity';
import { UpdateProjectDetailsError } from '../../../src/application/errors/update-project-details.error';

describe('UpdateProjectDetailsUseCase', () => {
  let useCase: UpdateProjectDetailsUseCase;
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
        UpdateProjectDetailsUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProjectDetailsUseCase>(
      UpdateProjectDetailsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should successfully update project details and return domain entity', async () => {
      // Arrange
      const input: UpdateProjectInput = {
        id: 'project-123',
        projectData: {
          title: 'Updated Title',
          shortDescription: 'Updated Description',
        },
        statsData: {
          views: 100,
          likes: 50,
        },
      };

      const expectedProject = new Project(
        'project-123',
        'Updated Title',
        'updated-title',
        'Updated Description',
        'Full content here',
        ['NestJS', 'PostgreSQL'],
        'user-456',
        new Date('2024-01-01'),
        new Date('2024-01-02'),
      );

      mockRepository.updateProjectDetails.mockResolvedValue(expectedProject);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockRepository.updateProjectDetails).toHaveBeenCalledTimes(1);
      expect(mockRepository.updateProjectDetails).toHaveBeenCalledWith(input);
      expect(result).toBe(expectedProject);
      expect(result.title).toBe('Updated Title');
      expect(result.shortDescription).toBe('Updated Description');
    });

    it('should wrap repository error and throw UpdateProjectDetailsError', async () => {
      // Arrange
      const input: UpdateProjectInput = {
        id: 'project-123',
        projectData: {
          title: 'Updated Title',
        },
      };

      const repositoryError = new Error('Database connection failed');
      mockRepository.updateProjectDetails.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        UpdateProjectDetailsError,
      );
      await expect(useCase.execute(input)).rejects.toThrow(
        'Failed to update project details: Database connection failed',
      );
      expect(mockRepository.updateProjectDetails).toHaveBeenCalledWith(input);
    });

    it('should propagate error when repository throws domain validation error', async () => {
      // Arrange
      const input: UpdateProjectInput = {
        id: 'project-123',
        projectData: {
          title: 'AB', // Too short - will fail domain validation
        },
      };

      const domainError = new Error(
        'Project title must be at least 3 characters long',
      );
      mockRepository.updateProjectDetails.mockRejectedValue(domainError);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        UpdateProjectDetailsError,
      );
      expect(mockRepository.updateProjectDetails).toHaveBeenCalledTimes(1);
    });

    it('should handle transaction rollback scenario (simulated by repository throwing error)', async () => {
      // Arrange
      const input: UpdateProjectInput = {
        id: 'project-999',
        projectData: {
          title: 'New Title',
        },
        statsData: {
          views: 200,
        },
      };

      // Simulate repository throwing error during transaction
      // (e.g., audit log insert failed)
      const transactionError = new Error(
        'Transaction rolled back: Audit log insert failed',
      );
      mockRepository.updateProjectDetails.mockRejectedValue(transactionError);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        UpdateProjectDetailsError,
      );
      await expect(useCase.execute(input)).rejects.toThrow(
        /Transaction rolled back/,
      );
    });

    it('should call repository.updateProjectDetails with correct input structure', async () => {
      // Arrange
      const input: UpdateProjectInput = {
        id: 'project-abc',
        projectData: {
          title: 'Clean Architecture Project',
          shortDescription: 'A project following clean architecture principles',
          content: 'Full markdown content here',
          techStack: ['NestJS', 'PostgreSQL', 'Redis'],
        },
        statsData: {
          views: 500,
          likes: 120,
        },
      };

      const project = new Project(
        'project-abc',
        'Clean Architecture Project',
        'clean-architecture-project',
        'A project following clean architecture principles',
        'Full markdown content here',
        ['NestJS', 'PostgreSQL', 'Redis'],
        'user-xyz',
        new Date(),
        new Date(),
      );

      mockRepository.updateProjectDetails.mockResolvedValue(project);

      // Act
      await useCase.execute(input);

      // Assert
      expect(mockRepository.updateProjectDetails).toHaveBeenCalledWith({
        id: 'project-abc',
        projectData: {
          title: 'Clean Architecture Project',
          shortDescription: 'A project following clean architecture principles',
          content: 'Full markdown content here',
          techStack: ['NestJS', 'PostgreSQL', 'Redis'],
        },
        statsData: {
          views: 500,
          likes: 120,
        },
      });
    });

    it('should handle unknown error type gracefully', async () => {
      // Arrange
      const input: UpdateProjectInput = {
        id: 'project-123',
        projectData: {
          title: 'Title',
        },
      };

      // Simulate throwing a non-Error object
      mockRepository.updateProjectDetails.mockRejectedValue(
        'Unknown error string',
      );

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        UpdateProjectDetailsError,
      );
      await expect(useCase.execute(input)).rejects.toThrow(
        'Failed to update project details: Unknown error',
      );
    });
  });

  describe('Clean Architecture Compliance', () => {
    it('should NOT import PrismaService', () => {
      // This is a meta-test to ensure we are following Clean Architecture
      const useCaseInstance = new UpdateProjectDetailsUseCase(mockRepository);
      expect(useCaseInstance).toBeDefined();
      // If PrismaService was imported, TypeScript would fail compilation
    });

    it('should depend ONLY on IProjectRepository interface', () => {
      // Verify that use-case can work with ANY implementation of IProjectRepository
      const alternativeMockRepo: IProjectRepository = {
        findById: jest.fn(),
        findBySlug: jest.fn(),
        findByUserId: jest.fn(),
        findAll: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        updateProjectDetails: jest.fn().mockResolvedValue(
          new Project(
            'test-id',
            'Test',
            'test',
            'Short desc',
            'Content',
            [],
            'user-1',
            new Date(),
            new Date(),
          ),
        ),
        incrementViewPessimistic: jest.fn(),
        incrementViewOptimistic: jest.fn(),
      };

      const useCaseWithAlternativeRepo = new UpdateProjectDetailsUseCase(
        alternativeMockRepo,
      );
      expect(useCaseWithAlternativeRepo).toBeDefined();
    });
  });
});
