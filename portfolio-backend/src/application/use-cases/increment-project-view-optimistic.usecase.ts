import { Injectable, Inject } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';

/**
 * Use Case: Increment Project View (Optimistic Locking)
 *
 * This use case safely increments a project's view count using
 * optimistic locking with version numbers to prevent lost updates
 * under concurrent access.
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * ✓ NO PrismaService import
 * ✓ Depends ONLY on IProjectRepository (domain interface)
 * ✓ ALL database logic delegated to infrastructure layer
 *
 * Concurrency Strategy: Optimistic Locking with Retry
 * - Uses version column to detect concurrent modifications
 * - Retries on version conflicts with exponential backoff
 * - Higher throughput than pessimistic locking
 * - May fail after max retries under extreme contention
 */
@Injectable()
export class IncrementProjectViewOptimisticUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Execute the use case to increment project views with optimistic locking
   *
   * @param projectId - The ID of the project to increment views for
   * @throws ProjectNotFoundError if project doesn't exist
   * @throws VersionConflictError if max retries exceeded
   */
  async execute(projectId: string): Promise<void> {
    // Delegate ALL optimistic locking logic to the repository
    // The repository handles:
    // - Version checking
    // - Retry logic with exponential backoff
    // - Incrementing views atomically
    // - Error handling (ProjectNotFoundError, VersionConflictError)
    await this.projectRepository.incrementViewOptimistic(projectId);
  }
}
