import { Inject, Injectable } from '@nestjs/common';
import * as commentRepositoryInterface from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';

/**
 * Application Layer Use Case
 *
 * This use case retrieves all comments for a specific project.
 * It depends ONLY on the domain layer (entities and repository interfaces).
 */
@Injectable()
export class GetCommentsByProjectUseCase {
  constructor(
    @Inject(commentRepositoryInterface.COMMENT_REPOSITORY)
    private readonly commentRepository: commentRepositoryInterface.ICommentRepository,
  ) {}

  async execute(projectId: string): Promise<Comment[]> {
    return await this.commentRepository.findByProjectId(projectId);
  }
}
