import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.usecase';
import { GetCommentsByProjectUseCase } from '../../application/use-cases/get-comments-by-project.usecase';
import {
  CreateCommentDto,
  CommentResponseDto,
} from '../../application/dtos/comment.dto';
import { CommentMapper } from '../mappers/comment.mapper';

/**
 * Comment Controller
 *
 * Interface layer controller handling HTTP requests for comment resources.
 * Delegates business logic to use cases and maps responses to DTOs.
 */
@Controller('comments')
export class CommentController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getCommentsByProjectUseCase: GetCommentsByProjectUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCommentDto): Promise<CommentResponseDto> {
    const comment = await this.createCommentUseCase.execute(dto);
    return CommentMapper.toDto(comment);
  }

  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.getCommentsByProjectUseCase.execute(projectId);
    return CommentMapper.toDtoArray(comments);
  }
}
