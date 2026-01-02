import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as projectRepositoryInterface from '../../domain/repositories/project.repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { CreateProjectDto } from '../dtos/project.dto';

/**
 * Input for CreateProjectUseCase - userId is required
 * (injected by controller from authenticated user)
 */
export interface CreateProjectInput extends CreateProjectDto {
  userId: string;
}

/**
 * Application Layer Use Case
 *
 * This use case orchestrates business logic for creating a project.
 * It depends ONLY on the domain layer (entities and repository interfaces).
 * It has NO knowledge of infrastructure implementation details.
 */
@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(projectRepositoryInterface.PROJECT_REPOSITORY)
    private readonly projectRepository: projectRepositoryInterface.IProjectRepository,
  ) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    if (!input.userId) {
      throw new BadRequestException('userId is required');
    }

    // Generate slug from title if not provided
    const slug = input.slug || Project.generateSlug(input.title);

    // Create new project entity (domain logic)
    const project = new Project(
      this.generateId(), // In real app, use UUID library
      input.title,
      slug,
      input.shortDescription,
      input.content,
      input.techStack || [],
      input.userId,
      new Date(),
      new Date(),
      input.thumbnailUrl,
      input.githubUrl,
      input.demoUrl,
    );

    // Persist using repository
    return await this.projectRepository.save(project);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}

