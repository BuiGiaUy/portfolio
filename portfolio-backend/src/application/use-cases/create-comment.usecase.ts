import { Inject, Injectable } from '@nestjs/common';
import * as commentRepositoryInterface from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { CreateCommentDto } from '../dtos/comment.dto';

/**
 * Application Layer Use Case
 *
 * This use case orchestrates business logic for creating a comment.
 * It depends ONLY on the domain layer (entities and repository interfaces).
 * It has NO knowledge of infrastructure implementation details.
 */
@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject(commentRepositoryInterface.COMMENT_REPOSITORY)
    private readonly commentRepository: commentRepositoryInterface.ICommentRepository,
  ) {}

  async execute(dto: CreateCommentDto): Promise<Comment> {
    // Create new comment entity (domain logic)
    const comment = new Comment(
      this.generateId(), // In real app, use UUID library
      dto.content,
      dto.userId,
      dto.projectId,
      new Date(),
      new Date(),
    );

    // Persist using repository
    return await this.commentRepository.save(comment);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
