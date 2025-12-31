import type { Prisma } from '../../generated/prisma/client';
import { Project } from '../../domain/entities/project.entity';

/**
 * Mapper for Project entity
 * Handles transformations between Domain and Persistence layers
 * Follows the Dependency Inversion Principle
 */
export class ProjectPersistenceMapper {
  /**
   * Convert Prisma Project model to Domain Project entity
   * @param prismaProject - The Prisma project object from database (with stats relation)
   * @returns Domain Project entity
   */
  static toDomain(prismaProject: Prisma.ProjectGetPayload<{ include: { stats: true } }>): Project {
    return new Project(
      prismaProject.id,
      prismaProject.title,
      prismaProject.slug,
      prismaProject.shortDescription,
      prismaProject.content,
      prismaProject.techStack,
      prismaProject.userId,
      prismaProject.createdAt,
      prismaProject.updatedAt,
      prismaProject.thumbnailUrl ?? undefined,
      prismaProject.githubUrl ?? undefined,
      prismaProject.demoUrl ?? undefined,
      prismaProject.stats?.views ?? 0, // Extract views from stats relation
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
    slug: string;
    shortDescription: string;
    content: string;
    techStack: string[];
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    thumbnailUrl?: string;
    githubUrl?: string;
    demoUrl?: string;
  } {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      content: project.content,
      techStack: project.techStack,
      userId: project.userId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      thumbnailUrl: project.thumbnailUrl,
      githubUrl: project.githubUrl,
      demoUrl: project.demoUrl,
    };
  }

  /**
   * Convert an array of Prisma projects to Domain entities
   * @param prismaProjects - Array of Prisma project objects (with stats relation)
   * @returns Array of Domain Project entities
   */
  static toDomainList(
    prismaProjects: Prisma.ProjectGetPayload<{ include: { stats: true } }>[],
  ): Project[] {
    return prismaProjects.map((project) => this.toDomain(project));
  }
}
