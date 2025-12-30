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
      findBySlug: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      updateProjectDetails: jest.fn(),
      incrementViewPessimistic: jest.fn(),
      incrementViewOptimistic: jest.fn(),
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
      slug: 'test-project',
      shortDescription: 'A short description for testing',
      content: 'This is the full content of the test project',
      techStack: ['NestJS', 'PostgreSQL'],
      userId: 'user-123',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      githubUrl: 'https://github.com/user/project',
      demoUrl: 'https://demo.example.com',
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
      expect(result.slug).toBe(createProjectDto.slug);
      expect(result.shortDescription).toBe(createProjectDto.shortDescription);
      expect(result.content).toBe(createProjectDto.content);
      expect(result.techStack).toEqual(createProjectDto.techStack);
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

    it('should auto-generate slug from title if not provided', async () => {
      // Arrange
      const dtoWithoutSlug: CreateProjectDto = {
        title: 'My Awesome Project',
        slug: '',
        shortDescription: 'A short description',
        content: 'Full content here',
        techStack: ['NestJS'],
        userId: 'user-123',
      };
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act
      const result = await useCase.execute(dtoWithoutSlug);

      // Assert
      expect(result.slug).toBe('my-awesome-project');
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
      expect(savedProject.slug).toBe(createProjectDto.slug);
      expect(savedProject.userId).toBe(createProjectDto.userId);
    });

    it('should throw error when title is too short (entity validation)', async () => {
      // Arrange
      const invalidDto: CreateProjectDto = {
        title: 'AB', // Too short
        slug: 'ab',
        shortDescription: 'Valid description',
        content: 'Valid content',
        techStack: [],
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
        slug: 'valid-slug',
        shortDescription: 'Valid description',
        content: 'Valid content',
        techStack: [],
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

    it('should throw error when content is empty (entity validation)', async () => {
      // Arrange
      const invalidDto: CreateProjectDto = {
        title: 'Valid Title',
        slug: 'valid-slug',
        shortDescription: 'Valid description',
        content: '', // Empty
        techStack: [],
        userId: 'user-123',
      };
      mockRepository.save.mockImplementation((project) =>
        Promise.resolve(project),
      );

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(
        'Project content is required',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
