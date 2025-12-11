import { Comment } from '../entities/comment.entity';

/**
 * Domain Repository Interface
 *
 * This interface defines the contract for comment persistence.
 * It belongs to the DOMAIN layer and has NO dependencies on infrastructure.
 *
 * The infrastructure layer will implement this interface.
 * This follows the Dependency Inversion Principle (DIP).
 */
export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>;
  findByUserId(userId: string): Promise<Comment[]>;
  findByProjectId(projectId: string): Promise<Comment[]>;
  save(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<void>;
}

/**
 * Injection token for dependency injection
 * This allows us to inject the repository implementation without coupling to it
 */
export const COMMENT_REPOSITORY = Symbol('ICommentRepository');
