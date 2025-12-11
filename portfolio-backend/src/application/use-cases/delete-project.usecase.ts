import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';

/**
 * Delete Project Use Case
 *
 * Application layer use case for deleting a project.
 * Returns the userId of the deleted project for cache invalidation.
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * ✓ NO PrismaService import
 * ✓ Depends ONLY on IProjectRepository (domain interface)
 */
@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Execute the delete operation
   *
   * @param projectId - ID of the project to delete
   * @returns Promise<{ userId: string }> - The userId of the deleted project
   * @throws NotFoundException if project is not found
   */
  async execute(projectId: string): Promise<{ userId: string }> {
    // First, fetch the project to get the userId (for cache invalidation)
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException(`Project with ID '${projectId}' not found`);
    }

    // Delete the project
    await this.projectRepository.delete(projectId);

    // Return userId for cache invalidation
    return { userId: project.userId };
  }
}
