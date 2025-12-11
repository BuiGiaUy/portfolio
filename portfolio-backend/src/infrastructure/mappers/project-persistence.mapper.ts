import type { Prisma } from '../../generated/prisma/client/client';
import { Project } from '../../domain/entities/project.entity';

/**
 * Mapper for Project entity
 * Handles transformations between Domain and Persistence layers
 * Follows the Dependency Inversion Principle
 */
export class ProjectPersistenceMapper {
  /**
   * Convert Prisma Project model to Domain Project entity
   * @param prismaProject - The Prisma project object from database
   * @returns Domain Project entity
   */
  static toDomain(prismaProject: Prisma.ProjectGetPayload<object>): Project {
    return new Project(
      prismaProject.id,
      prismaProject.title,
      prismaProject.description,
      prismaProject.userId,
      prismaProject.createdAt,
      prismaProject.updatedAt,
      prismaProject.views ?? 0,
      prismaProject.version ?? 1,
      prismaProject.status ?? undefined,
    );
  }

  /**
   * Convert Domain Project entity to Prisma persistence format
   * @param project - The Domain project entity
   * @returns Prisma-compatible project object
   */
  static toPersistence(project: Project): {
    id: string;
    title: string;
    description: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    views: number;
    version: number;
    status?: string;
  } {
    return {
      id: project.id,
      title: project.title,
      description: project.description,
      userId: project.userId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      views: project.views,
      version: project.version,
      status: project.status,
    };
  }

  /**
   * Convert an array of Prisma projects to Domain entities
   * @param prismaProjects - Array of Prisma project objects
   * @returns Array of Domain Project entities
   */
  static toDomainList(
    prismaProjects: Prisma.ProjectGetPayload<object>[],
  ): Project[] {
    return prismaProjects.map((project) => this.toDomain(project));
  }
}
