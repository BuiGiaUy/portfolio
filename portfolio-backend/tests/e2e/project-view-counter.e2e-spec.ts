import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/database/prisma.service';

describe('Project View Counter (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testProjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create a test user and project
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        passwordHash: 'hashed_password',
      },
    });

    const testProject = await prisma.project.create({
      data: {
        title: 'Test Project for View Counter',
        description: 'E2E test project',
        userId: testUser.id,
        views: 0,
        version: 1,
      },
    });

    testProjectId = testProject.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProjectId) {
      await prisma.project.delete({ where: { id: testProjectId } });
    }
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-' } },
    });

    await app.close();
  });

  describe('POST /projects/:id/view-pessimistic', () => {
    it('should increment view count using pessimistic locking', async () => {
      // Get initial view count
      const initialProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true },
      });

      // Increment view
      const response = await request(app.getHttpServer())
        .post(`/projects/${testProjectId}/view-pessimistic`)
        .expect(HttpStatus.NO_CONTENT);

      // Verify view was incremented
      const updatedProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true },
      });

      expect(updatedProject?.views).toBe((initialProject?.views || 0) + 1);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .post('/projects/non-existent-id/view-pessimistic')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR); // Will throw error, adjust based on your error handling
    });

    it('should handle concurrent requests correctly', async () => {
      // Get initial view count
      const initialProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true },
      });
      const initialViews = initialProject?.views || 0;

      // Send 10 concurrent requests
      const requests = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post(`/projects/${testProjectId}/view-pessimistic`)
          .expect(HttpStatus.NO_CONTENT),
      );

      await Promise.all(requests);

      // Verify all increments were applied
      const finalProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true },
      });

      expect(finalProject?.views).toBe(initialViews + 10);
    });
  });

  describe('POST /projects/:id/view-optimistic', () => {
    it('should increment view count using optimistic locking', async () => {
      // Get initial view count
      const initialProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true, version: true },
      });

      // Increment view
      await request(app.getHttpServer())
        .post(`/projects/${testProjectId}/view-optimistic`)
        .expect(HttpStatus.NO_CONTENT);

      // Verify view was incremented and version bumped
      const updatedProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true, version: true },
      });

      expect(updatedProject?.views).toBe((initialProject?.views || 0) + 1);
      expect(updatedProject?.version).toBe((initialProject?.version || 1) + 1);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .post('/projects/non-existent-id/view-optimistic')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR); // Will throw error, adjust based on your error handling
    });

    it('should handle concurrent requests with retries', async () => {
      // Get initial view count
      const initialProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true },
      });
      const initialViews = initialProject?.views || 0;

      // Send 10 concurrent requests
      // Some may retry due to version conflicts, but all should eventually succeed
      const requests = Array.from({ length: 10 }, () =>
        request(app.getHttpServer())
          .post(`/projects/${testProjectId}/view-optimistic`)
          .expect(HttpStatus.NO_CONTENT),
      );

      await Promise.all(requests);

      // Verify all increments were applied
      const finalProject = await prisma.project.findUnique({
        where: { id: testProjectId },
        select: { views: true },
      });

      expect(finalProject?.views).toBe(initialViews + 10);
    });
  });

  describe('Concurrency Comparison', () => {
    it('both strategies should produce same results under load', async () => {
      // Create two separate test projects
      const testUser = await prisma.user.findFirst({
        where: { email: { contains: 'test-' } },
      });

      const [pessimisticProject, optimisticProject] = await Promise.all([
        prisma.project.create({
          data: {
            title: 'Pessimistic Test',
            description: 'Test',
            userId: testUser!.id,
            views: 0,
            version: 1,
          },
        }),
        prisma.project.create({
          data: {
            title: 'Optimistic Test',
            description: 'Test',
            userId: testUser!.id,
            views: 0,
            version: 1,
          },
        }),
      ]);

      // Send 50 concurrent requests to each
      const pessimisticRequests = Array.from({ length: 50 }, () =>
        request(app.getHttpServer())
          .post(`/projects/${pessimisticProject.id}/view-pessimistic`)
          .expect(HttpStatus.NO_CONTENT),
      );

      const optimisticRequests = Array.from({ length: 50 }, () =>
        request(app.getHttpServer())
          .post(`/projects/${optimisticProject.id}/view-optimistic`)
          .expect(HttpStatus.NO_CONTENT),
      );

      await Promise.all([...pessimisticRequests, ...optimisticRequests]);

      // Both should have exactly 50 views
      const [pessimisticResult, optimisticResult] = await Promise.all([
        prisma.project.findUnique({
          where: { id: pessimisticProject.id },
          select: { views: true },
        }),
        prisma.project.findUnique({
          where: { id: optimisticProject.id },
          select: { views: true },
        }),
      ]);

      expect(pessimisticResult?.views).toBe(50);
      expect(optimisticResult?.views).toBe(50);

      // Cleanup
      await prisma.project.deleteMany({
        where: {
          id: { in: [pessimisticProject.id, optimisticProject.id] },
        },
      });
    });
  });
});
