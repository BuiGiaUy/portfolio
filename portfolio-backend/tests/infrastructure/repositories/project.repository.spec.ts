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
    it('should retry on version conflict and succeed', async () => {
      // Mock findUnique to return project with version 1
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        views: 10,
        version: 1,
      });

      // Mock updateMany to fail once (count: 0) then succeed (count: 1)
      (prismaService.project.updateMany as jest.Mock)
        .mockResolvedValueOnce({ count: 0 }) // Fail 1st attempt
        .mockResolvedValueOnce({ count: 1 }); // Succeed 2nd attempt

      await repository.incrementViewOptimistic('123');

      expect(prismaService.project.updateMany).toHaveBeenCalledTimes(2);
    });

    it('should throw VersionConflictError after max retries', async () => {
      (prismaService.project.findUnique as jest.Mock).mockResolvedValue({
        id: '123',
        views: 10,
        version: 1,
      });

      // Always fail
      (prismaService.project.updateMany as jest.Mock).mockResolvedValue({
        count: 0,
      });

      await expect(repository.incrementViewOptimistic('123')).rejects.toThrow(
        VersionConflictError,
      );
      // 3 retries = 3 calls
      expect(prismaService.project.updateMany).toHaveBeenCalledTimes(3);
    });
  });
});
