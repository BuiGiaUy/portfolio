/**
 * Application Layer DTOs
 *
 * DTOs are used to transfer data between layers.
 * They have no business logic and no dependencies.
 */
export class CreateProjectDto {
  title!: string;
  description!: string;
  userId!: string;
}

export class UpdateProjectDto {
  title?: string;
  description?: string;
}

export class ProjectResponseDto {
  id!: string;
  title!: string;
  description!: string;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
