import { Test, TestingModule } from '@nestjs/testing';
import { PrismaProjectRepository } from '../../../src/infrastructure/repositories/project.repository';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { ProjectNotFoundError } from '../../../src/application/errors/project-not-found.error';
import { VersionConflictError } from '../../../src/application/errors/version-conflict.error';

describe('PrismaProjectRepository', () => {
  let repository: PrismaProjectRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProjectRepository,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            projectStats: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb(prismaService)),
            $queryRawUnsafe: jest.fn(),
            $executeRawUnsafe: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaProjectRepository>(PrismaProjectRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('incrementViewOptimistic', () => {
    it('should create stats if they do not exist', async () => {
      // Mock findUnique to return project exists
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
      });

      // Mock projectStats findUnique to return null (stats don't exist)
      (prismaService.projectStats.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock create
      (prismaService.projectStats.create as jest.Mock).mockResolvedValue({
        id: 'stats-123',
        projectId: '123',
        views: 1,
        likes: 0,
      });

      await repository.incrementViewOptimistic('123');

      expect(prismaService.projectStats.create).toHaveBeenCalledWith({
        data: {
          projectId: '123',
          views: 1,
          likes: 0,
        },
      });
    });

    it('should increment views if stats exist', async () => {
      // Mock findUnique to return project exists
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
      });

      // Mock projectStats findUnique to return existing stats
      (prismaService.projectStats.findUnique as jest.Mock).mockResolvedValue({
        id: 'stats-123',
        views: 10,
      });

      // Mock update
      (prismaService.projectStats.update as jest.Mock).mockResolvedValue({
        id: 'stats-123',
        projectId: '123',
        views: 11,
      });

      await repository.incrementViewOptimistic('123');

      expect(prismaService.projectStats.update).toHaveBeenCalledWith({
        where: { projectId: '123' },
        data: {
          views: 11,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw ProjectNotFoundError if project does not exist', async () => {
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(repository.incrementViewOptimistic('999')).rejects.toThrow(
        ProjectNotFoundError,
      );
    });
  });
});
