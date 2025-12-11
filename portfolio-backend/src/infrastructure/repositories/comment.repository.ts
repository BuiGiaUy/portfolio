import { Injectable } from '@nestjs/common';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { PrismaService } from '../database/prisma.service';
import { CommentPersistenceMapper } from '../mappers/comment-persistence.mapper';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Comment | null> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) return null;
    return CommentPersistenceMapper.toDomain(comment);
  }

  async findByUserId(userId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { userId },
    });
    return CommentPersistenceMapper.toDomainList(comments);
  }

  async findByProjectId(projectId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { projectId },
    });
    return CommentPersistenceMapper.toDomainList(comments);
  }

  async save(comment: Comment): Promise<Comment> {
    const savedComment = await this.prisma.comment.upsert({
      where: { id: comment.id },
      update: {
        content: comment.content,
        updatedAt: comment.updatedAt,
      },
      create: {
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        projectId: comment.projectId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
    return CommentPersistenceMapper.toDomain(savedComment);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }
}
