import { Injectable, Inject } from '@nestjs/common';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';

/**
 * Use Case: Increment Project View (Pessimistic Locking)
 *
 * This use case safely increments a project's view count using
 * pessimistic locking (SELECT ... FOR UPDATE) to prevent lost updates
 * under concurrent access.
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * ✓ NO PrismaService import
 * ✓ Depends ONLY on IProjectRepository (domain interface)
 * ✓ ALL database logic delegated to infrastructure layer
 *
 * Concurrency Strategy: Pessimistic Write Lock
 * - Uses SELECT ... FOR UPDATE to lock the row
 * - Blocks other transactions from reading or writing
 * - Guarantees no lost updates but may reduce throughput
 */
@Injectable()
export class IncrementProjectViewPessimisticUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Execute the use case to increment project views with pessimistic locking
   *
   * @param projectId - The ID of the project to increment views for
   * @throws ProjectNotFoundError if project doesn't exist
   */
  async execute(projectId: string): Promise<void> {
    // Delegate ALL locking logic to the repository
    // The repository handles:
    // - Prisma transaction
    // - SELECT ... FOR UPDATE
    // - Incrementing views atomically
    // - Error handling (ProjectNotFoundError)
    await this.projectRepository.incrementViewPessimistic(projectId);
  }
}
