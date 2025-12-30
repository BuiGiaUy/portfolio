import { Project } from '../entities/project.entity';

/**
 * Domain Repository Interface
 *
 * This interface defines the contract for project persistence.
 * It belongs to the DOMAIN layer and has NO dependencies on infrastructure.
 *
 * The infrastructure layer will implement this interface.
 * This follows the Dependency Inversion Principle (DIP).
 */

/**
 * Input for updating project details transactionally
 */
export interface UpdateProjectInput {
  id: string;
  projectData?: {
    title?: string;
    slug?: string;
    shortDescription?: string;
    content?: string;
    techStack?: string[];
    thumbnailUrl?: string;
    githubUrl?: string;
    demoUrl?: string;
  };
  statsData?: {
    views?: number;
    likes?: number;
  };
}

export interface IProjectRepository {
  // ─────────────────────────────────────────────────────────────
  // BASIC CRUD METHODS
  // ─────────────────────────────────────────────────────────────
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  findAll(): Promise<Project[]>;
  save(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;

  // ─────────────────────────────────────────────────────────────
  // WEEK 2 METHODS: Transactional Operations & Concurrency Control
  // ─────────────────────────────────────────────────────────────

  /**
   * Update project details transactionally across multiple tables:
   * - project table
   * - project_stats table
   * - audit_logs table
   *
   * @param input - Update input containing project ID and partial updates
   * @returns Updated project as domain entity
   * @throws Error if transaction fails
   */
  updateProjectDetails(input: UpdateProjectInput): Promise<Project>;

  /**
   * Increment project view count using pessimistic locking
   * (SELECT ... FOR UPDATE)
   *
   * @param projectId - ID of the project to increment views for
   * @throws Error if project not found
   */
  incrementViewPessimistic(projectId: string): Promise<void>;

  /**
   * Increment project view count using optimistic locking
   * (version column check with retry logic)
   *
   * @param projectId - ID of the project to increment views for
   * @throws Error if project not found or max retries exceeded
   */
  incrementViewOptimistic(projectId: string): Promise<void>;
}

/**
 * Injection token for dependency injection
 * This allows us to inject the repository implementation without coupling to it
 */
export const PROJECT_REPOSITORY = Symbol('IProjectRepository');
