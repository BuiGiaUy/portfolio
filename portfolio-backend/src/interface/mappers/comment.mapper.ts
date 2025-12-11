import { Comment } from '../../domain/entities/comment.entity';
import { CommentResponseDto } from '../../application/dtos/comment.dto';

/**
 * Mapper: Domain Entity to DTO
 *
 * Mappers convert between domain entities and DTOs.
 * This keeps the domain layer clean and prevents exposing internal details.
 */
export class CommentMapper {
  static toDto(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      projectId: comment.projectId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  static toDtoArray(comments: Comment[]): CommentResponseDto[] {
    return comments.map((comment) => this.toDto(comment));
  }
}
