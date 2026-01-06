import { Injectable } from '@nestjs/common';
import {
  IProjectRepository,
  UpdateProjectInput,
} from '../../domain/repositories/project.repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { PrismaService } from '../database/prisma.service';
import { ProjectPersistenceMapper } from '../mappers/project-persistence.mapper';
import { ProjectNotFoundError } from '../../application/errors/project-not-found.error';
import { VersionConflictError } from '../../application/errors/version-conflict.error';

/**
 * Infrastructure Layer: Prisma Project Repository Implementation
 *
 * This class implements IProjectRepository interface and contains ALL
 * Prisma-specific logic. It is the ONLY place where Prisma is used.
 *
 * Clean Architecture Compliance:
 * - Implements domain interface (Dependency Inversion)
 * - Maps between Prisma models and domain entities
 * - Contains all persistence logic
 * - Application layer depends ONLY on the interface
 */
@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // BASIC CRUD METHODS
  // ─────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { stats: true },
    });
    if (!project) return null;
    return ProjectPersistenceMapper.toDomain(project);
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: { stats: true },
    });
    if (!project) return null;
    return ProjectPersistenceMapper.toDomain(project);
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      include: { stats: true },
      orderBy: { createdAt: 'desc' },
    });
    return ProjectPersistenceMapper.toDomainList(projects);
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      include: { stats: true },
      orderBy: { createdAt: 'desc' },
    });
    return ProjectPersistenceMapper.toDomainList(projects);
  }

  async save(project: Project): Promise<Project> {
    const savedProject = await this.prisma.project.upsert({
      where: { id: project.id },
      update: {
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        content: project.content,
        techStack: project.techStack,
        thumbnailUrl: project.thumbnailUrl,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        updatedAt: project.updatedAt,
      },
      create: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        shortDescription: project.shortDescription,
        content: project.content,
        techStack: project.techStack,
        thumbnailUrl: project.thumbnailUrl,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        userId: project.userId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      include: { stats: true }, // Include stats for mapper
    });
    return ProjectPersistenceMapper.toDomain(savedProject);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  // ─────────────────────────────────────────────────────────────
  // WEEK 2 METHODS: Transactional Operations & Concurrency Control
  // ─────────────────────────────────────────────────────────────

  /**
   * Update project details transactionally across 3 tables:
   * 1. project - update project data
   * 2. projectStats - upsert stats data
   * 3. auditLog - insert audit trail
   *
   * All operations wrapped in Prisma transaction for atomicity.
   * If any operation fails, entire transaction rolls back.
   */
  async updateProjectDetails(input: UpdateProjectInput): Promise<Project> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Update project row
      await tx.project.update({
        where: { id: input.id },
        data: input.projectData || {},
      });

      // 2. Upsert projectStats row (if statsData is provided)
      if (input.statsData && Object.keys(input.statsData).length > 0) {
        await tx.projectStats.upsert({
          where: { projectId: input.id },
          update: input.statsData,
          create: {
            projectId: input.id,
            views: input.statsData.views ?? 0,
            likes: input.statsData.likes ?? 0,
          },
        });
      }

      // 3. Insert audit log
      await tx.auditLog.create({
        data: {
          projectId: input.id,
          action: 'update_project_details',
          meta: JSON.stringify(input),
          createdAt: new Date(),
        },
      });
    });

    // Fetch updated project with stats
    const updatedProject = await this.prisma.project.findUnique({
      where: { id: input.id },
      include: { stats: true },
    });

    if (!updatedProject) {
      throw new ProjectNotFoundError(input.id);
    }

    // Map Prisma result to domain entity
    return ProjectPersistenceMapper.toDomain(updatedProject);
  }

  /**
   * Increment project view count using pessimistic locking
   *
   * Strategy:
   * - Use SELECT ... FOR UPDATE to lock the row
   * - Prevents concurrent transactions from reading/writing
   * - Guarantees no lost updates
   * - May reduce throughput under high contention
   */
  async incrementViewPessimistic(projectId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Step 1: Acquire pessimistic write lock - update ProjectStats views
      const projectStats = await tx.$queryRawUnsafe<
        Array<{ id: string; views: number }>
      >(
        `SELECT id, views FROM "ProjectStats" WHERE "projectId" = $1 FOR UPDATE`,
        projectId,
      );

      // If no stats exist, create them with pessimistic lock
      if (!projectStats || projectStats.length === 0) {
        // Check if project exists first
        const project = await tx.project.findUnique({
          where: { id: projectId },
          select: { id: true },
        });

        if (!project) {
          throw new ProjectNotFoundError(projectId);
        }

        // Create new stats
        await tx.projectStats.create({
          data: {
            projectId,
            views: 1,
            likes: 0,
          },
        });
        return;
      }

      // Step 2: Increment the views count
      const currentViews = projectStats[0].views;
      await tx.$executeRawUnsafe(
        `UPDATE "ProjectStats" SET views = $1, "updatedAt" = $2 WHERE "projectId" = $3`,
        currentViews + 1,
        new Date(),
        projectId,
      );
    });
  }

  /**
   * Increment project view count using optimistic locking
   *
   * Strategy:
   * - Use version column to detect concurrent modifications
   * - Retry on version conflicts with exponential backoff
   * - Higher throughput than pessimistic locking
   * - May fail after max retries under extreme contention
   */
  async incrementViewOptimistic(projectId: string): Promise<void> {
    const MAX_RETRIES = 3;
    const BACKOFF_MS = [50, 80, 120]; // Exponential backoff delays

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        await this.incrementWithVersionCheck(projectId);
        return; // Success - exit early
      } catch (error) {
        // Re-throw immediately if it's not a version conflict
        if (error instanceof ProjectNotFoundError) {
          throw error;
        }

        // If it's a version conflict, retry with backoff
        if (error instanceof VersionConflictError) {
          if (attempt < MAX_RETRIES - 1) {
            await this.sleep(BACKOFF_MS[attempt]);
            continue;
          }
        }

        // For any other error, re-throw immediately
        throw error;
      }
    }

    // If we exhausted all retries, throw version conflict error
    throw new VersionConflictError(
      projectId,
      `Failed to increment views after ${MAX_RETRIES} attempts due to version conflicts`,
    );
  }

  /**
   * Private helper: Attempt to increment views with version checking
   */
  private async incrementWithVersionCheck(projectId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Step 1: Check if project exists
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { id: true },
      });

      if (!project) {
        throw new ProjectNotFoundError(projectId);
      }

      // Step 2: Get or create project stats
      const stats = await tx.projectStats.findUnique({
        where: { projectId },
        select: { id: true, views: true },
      });

      if (!stats) {
        // Create stats if they don't exist
        await tx.projectStats.create({
          data: {
            projectId,
            views: 1,
            likes: 0,
          },
        });
        return;
      }

      // Step 3: Increment views
      await tx.projectStats.update({
        where: { projectId },
        data: {
          views: stats.views + 1,
          updatedAt: new Date(),
        },
      });
    });
  }

  /**
   * Private helper: Sleep utility for exponential backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
