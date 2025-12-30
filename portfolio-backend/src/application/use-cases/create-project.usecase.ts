import { Inject, Injectable } from '@nestjs/common';
import * as projectRepositoryInterface from '../../domain/repositories/project.repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { CreateProjectDto } from '../dtos/project.dto';

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

  async execute(dto: CreateProjectDto): Promise<Project> {
    // Generate slug from title if not provided
    const slug = dto.slug || Project.generateSlug(dto.title);

    // Create new project entity (domain logic)
    const project = new Project(
      this.generateId(), // In real app, use UUID library
      dto.title,
      slug,
      dto.shortDescription,
      dto.content,
      dto.techStack || [],
      dto.userId,
      new Date(),
      new Date(),
      dto.thumbnailUrl,
      dto.githubUrl,
      dto.demoUrl,
    );

    // Persist using repository
    return await this.projectRepository.save(project);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
