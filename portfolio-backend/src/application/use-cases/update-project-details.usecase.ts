import { Injectable, Inject } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
  UpdateProjectInput,
} from '../../domain/repositories/project.repository.interface';
import { UpdateProjectDetailsError } from '../errors/update-project-details.error';

/**
 * Application Layer Use Case (CLEAN ARCHITECTURE ✓)
 *
 * This use case orchestrates a transactional update across multiple tables:
 * - project: Updates project details
 * - projectStats: Updates project statistics
 * - auditLog: Inserts audit trail
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * ✓ NO PrismaService import
 * ✓ Depends ONLY on IProjectRepository (domain interface)
 * ✓ ALL database logic delegated to infrastructure layer
 * ✓ This use case contains ONLY orchestration logic
 *
 * Dependencies:
 * - IProjectRepository (Domain Layer interface)
 * - Project entity (Domain Layer)
 */
@Injectable()
export class UpdateProjectDetailsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Execute the transactional update
   *
   * @param input - The update input containing project ID and partial updates
   * @returns Promise<Project> - The updated project as a domain entity
   * @throws UpdateProjectDetailsError if the transaction fails
   */
  async execute(input: UpdateProjectInput): Promise<Project> {
    try {
      // Delegate ALL transactional logic to the repository
      // The repository handles:
      // - Prisma transaction
      // - Updating project table
      // - Upserting projectStats table
      // - Inserting audit log
      // - Mapping Prisma model to domain entity
      return await this.projectRepository.updateProjectDetails(input);
    } catch (error) {
      // Wrap repository errors into custom application error
      const errorMessage =
        error instanceof Error
          ? `Failed to update project details: ${error.message}`
          : 'Failed to update project details: Unknown error';

      throw new UpdateProjectDetailsError(
        errorMessage,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
