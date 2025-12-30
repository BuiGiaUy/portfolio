/**
 * Application Layer DTOs
 *
 * DTOs are used to transfer data between layers.
 * They have no business logic and no dependencies.
 */
export class CreateProjectDto {
  title!: string;
  slug!: string;
  shortDescription!: string;
  content!: string;
  techStack!: string[];
  userId!: string;
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export class UpdateProjectDto {
  title?: string;
  slug?: string;
  shortDescription?: string;
  content?: string;
  techStack?: string[];
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export class ProjectResponseDto {
  id!: string;
  title!: string;
  slug!: string;
  shortDescription!: string;
  content!: string;
  techStack!: string[];
  userId!: string;
  thumbnailUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
