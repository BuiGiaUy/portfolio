import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';

/**
 * Get Project Use Case
 *
 * Application layer use case for fetching a single project by ID.
 * Used primarily for:
 * - Fetching project before update/delete operations
 * - Getting project details for display
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * ✓ NO PrismaService import
 * ✓ Depends ONLY on IProjectRepository (domain interface)
 */
@Injectable()
export class GetProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Execute the use case
   *
   * @param projectId - ID of the project to fetch
   * @returns Promise<Project> - The found project as a domain entity
   * @throws NotFoundException if project is not found
   */
  async execute(projectId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID '${projectId}' not found`);
    }

    return project;
  }
}
