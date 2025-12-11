/**
 * Application Layer DTOs for Transactional Project Updates
 *
 * These DTOs define the input structure for updating project details
 * across multiple tables in a single transaction.
 */

/**
 * Partial project data that can be updated
 */
export interface ProjectDataUpdate {
  title?: string;
  description?: string;
  status?: string;
}
export interface UpdateProjectDetailsDto {
  title?: string;
  description?: string;
  status?: string;
  stats?: StatsDataUpdate;
}
/**
 * Partial project stats that can be updated
 */
export interface StatsDataUpdate {
  views?: number;
  likes?: number;
}

/**
 * Input DTO for updating project details transactionally
 */
export interface UpdateProjectInput {
  /**
   * The ID of the project to update
   */
  id: string;

  /**
   * Partial updates to the project table
   */
  projectData?: ProjectDataUpdate;

  /**
   * Partial updates to the project stats table
   */
  statsData?: StatsDataUpdate;
}
