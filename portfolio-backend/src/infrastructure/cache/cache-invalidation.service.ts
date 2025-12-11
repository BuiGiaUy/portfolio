import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

/**
 * Cache Invalidation Service
 *
 * Provides pattern-based cache invalidation strategies for projects.
 * Uses Redis pattern matching to efficiently invalidate related cache entries.
 *
 * Pattern Strategies:
 * - Project-specific: cache:/projects/{id}*
 * - User's projects: cache:/projects/user/{userId}*
 * - All projects: cache:/projects*
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private readonly cacheService: RedisCacheService) {}

  /**
   * Invalidate cache for a specific project
   *
   * Clears all cache entries related to a single project.
   * Pattern: cache:/projects/{projectId}*
   *
   * @param projectId - Project ID to invalidate
   */
  async invalidateProject(projectId: string): Promise<void> {
    const pattern = `cache:/projects/${projectId}*`;
    await this.invalidateByPattern(pattern, `project ${projectId}`);
  }

  /**
   * Invalidate all project caches for a specific user
   *
   * Clears user's project list cache.
   * Pattern: cache:/projects/user/{userId}*
   *
   * @param userId - User ID to invalidate projects for
   */
  async invalidateUserProjects(userId: string): Promise<void> {
    const pattern = `cache:/projects/user/${userId}*`;
    await this.invalidateByPattern(pattern, `user ${userId} projects`);
  }

  /**
   * Invalidate all project-related caches
   *
   * Clears ALL project caches across the application.
   * Pattern: cache:/projects*
   *
   * Use with caution in production - prefer specific invalidation.
   */
  async invalidateAllProjects(): Promise<void> {
    const pattern = 'cache:/projects*';
    await this.invalidateByPattern(pattern, 'all projects');
  }

  /**
   * Invalidate caches for project mutation operations
   *
   * Convenience method that invalidates:
   * - Project-specific cache
   * - User's project list cache
   *
   * @param projectId - Project ID being modified
   * @param userId - Owner's user ID
   */
  async invalidateProjectMutation(
    projectId: string,
    userId: string,
  ): Promise<void> {
    await Promise.all([
      this.invalidateProject(projectId),
      this.invalidateUserProjects(userId),
    ]);
  }

  /**
   * Invalidate caches for project creation
   *
   * After creating a project, invalidates:
   * - User's project list cache
   * - All projects cache (for global listings)
   *
   * @param userId - Creator's user ID
   */
  async invalidateOnCreate(userId: string): Promise<void> {
    await Promise.all([
      this.invalidateUserProjects(userId),
      this.cacheService.delByPattern('cache:/projects?*'), // Invalidate list queries
    ]);
  }

  /**
   * Invalidate caches for project deletion
   *
   * After deleting a project, invalidates:
   * - Project-specific cache
   * - User's project list cache
   *
   * @param projectId - Deleted project ID
   * @param userId - Owner's user ID
   */
  async invalidateOnDelete(projectId: string, userId: string): Promise<void> {
    await this.invalidateProjectMutation(projectId, userId);
  }

  /**
   * Invalidate caches for project update
   *
   * After updating a project, invalidates:
   * - Project-specific cache
   * - User's project list cache
   *
   * @param projectId - Updated project ID
   * @param userId - Owner's user ID
   */
  async invalidateOnUpdate(projectId: string, userId: string): Promise<void> {
    await this.invalidateProjectMutation(projectId, userId);
  }

  /**
   * Invalidate caches for view increment
   *
   * After incrementing views, invalidates project-specific cache.
   *
   * @param projectId - Project ID with incremented views
   */
  async invalidateOnViewIncrement(projectId: string): Promise<void> {
    await this.invalidateProject(projectId);
  }

  /**
   * Generic pattern-based cache invalidation
   *
   * @param pattern - Redis key pattern (supports * wildcards)
   * @param description - Human-readable description for logging
   */
  private async invalidateByPattern(
    pattern: string,
    description: string,
  ): Promise<void> {
    try {
      const deletedCount = await this.cacheService.delByPattern(pattern);
      this.logger.debug(
        `Invalidated ${deletedCount} cache entries for ${description} (pattern: ${pattern})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for ${description}: ${error}`,
      );
      // Fail silently - cache invalidation should not break the application
    }
  }
}
