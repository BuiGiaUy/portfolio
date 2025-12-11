/**
 * Application Layer DTOs
 *
 * DTOs are used to transfer data between layers.
 * They have no business logic and no dependencies.
 */
export class CreateCommentDto {
  content!: string;
  userId!: string;
  projectId!: string;
}

export class CommentResponseDto {
  id!: string;
  content!: string;
  userId!: string;
  projectId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
