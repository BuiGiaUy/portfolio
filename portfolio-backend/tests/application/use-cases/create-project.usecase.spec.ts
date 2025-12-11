import { Test, TestingModule } from '@nestjs/testing';
import { CreateProjectUseCase } from 'src/application/use-cases/create-project.usecase';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from 'src/domain/repositories/project.repository.interface';
import { Project } from 'src/domain/entities/project.entity';
import { CreateProjectDto } from 'src/application/dtos/project.dto';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let mockRepository: jest.Mocked<IProjectRepository>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProjectUseCase,
        {
          provide: PROJECT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateProjectUseCase>(CreateProjectUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createProjectDto: CreateProjectDto = {
      title: 'Test Project',
      description: 'This is a test project description',
      userId: 'user-123',
    };

    it('should create a new project successfully', async () => {
      // Arrange
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act
      const result = await useCase.execute(createProjectDto);

      // Assert
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Project);
      expect(result.title).toBe(createProjectDto.title);
      expect(result.description).toBe(createProjectDto.description);
      expect(result.userId).toBe(createProjectDto.userId);
    });

    it('should generate an id for the new project', async () => {
      // Arrange
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act
      const result = await useCase.execute(createProjectDto);

      // Assert
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      // Arrange
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );
      const beforeExecution = new Date();

      // Act
      const result = await useCase.execute(createProjectDto);

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

    it('should call repository save with created project', async () => {
      // Arrange
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act
      await useCase.execute(createProjectDto);

      // Assert
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      const savedProject = mockRepository.save.mock.calls[0][0];
      expect(savedProject).toBeInstanceOf(Project);
      expect(savedProject.title).toBe(createProjectDto.title);
      expect(savedProject.description).toBe(createProjectDto.description);
      expect(savedProject.userId).toBe(createProjectDto.userId);
    });

    it('should throw error when title is too short (entity validation)', async () => {
      // Arrange
      const invalidDto: CreateProjectDto = {
        title: 'AB', // Too short
        description: 'Valid description',
        userId: 'user-123',
      };
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        'Project title must be at least 3 characters long',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when title is too long (entity validation)', async () => {
      // Arrange
      const invalidDto: CreateProjectDto = {
        title: 'A'.repeat(101), // Too long
        description: 'Valid description',
        userId: 'user-123',
      };
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        'Project title must not exceed 100 characters',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error when description is empty (entity validation)', async () => {
      // Arrange
      const invalidDto: CreateProjectDto = {
        title: 'Valid Title',
        description: '', // Empty
        userId: 'user-123',
      };
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        'Project description is required',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
