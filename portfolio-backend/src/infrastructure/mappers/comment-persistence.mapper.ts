import type { Prisma } from '../../generated/prisma/client';
import { Comment } from '../../domain/entities/comment.entity';

/**
 * Mapper for Comment entity
 * Handles transformations between Domain and Persistence layers
 * Follows the Dependency Inversion Principle
 */
export class CommentPersistenceMapper {
  /**
   * Convert Prisma Comment model to Domain Comment entity
   * @param prismaComment - The Prisma comment object from database
   * @returns Domain Comment entity
   */
  static toDomain(prismaComment: Prisma.CommentGetPayload<object>): Comment {
    return new Comment(
      prismaComment.id,
      prismaComment.content,
      prismaComment.userId,
      prismaComment.projectId,
      prismaComment.createdAt,
      prismaComment.updatedAt,
    );
  }

  /**
   * Convert Domain Comment entity to Prisma persistence format
   * @param comment - The Domain comment entity
   * @returns Prisma-compatible comment object
   */
  static toPersistence(comment: Comment): {
    id: string;
    content: string;
    userId: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      projectId: comment.projectId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  /**
   * Convert an array of Prisma comments to Domain entities
   * @param prismaComments - Array of Prisma comment objects
   * @returns Array of Domain Comment entities
   */
  static toDomainList(
    prismaComments: Prisma.CommentGetPayload<object>[],
  ): Comment[] {
    return prismaComments.map((comment) => this.toDomain(comment));
  }
}
