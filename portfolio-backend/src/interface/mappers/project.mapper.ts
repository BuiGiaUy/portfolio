import { Project } from '../../domain/entities/project.entity';
import { ProjectResponseDto } from '../../application/dtos/project.dto';

/**
 * Mapper: Domain Entity to DTO
 *
 * Mappers convert between domain entities and DTOs.
 * This keeps the domain layer clean and prevents exposing internal details.
 */
export class ProjectMapper {
  static toDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      shortDescription: project.shortDescription,
      content: project.content,
      techStack: project.techStack,
      userId: project.userId,
      thumbnailUrl: project.thumbnailUrl,
      githubUrl: project.githubUrl,
      demoUrl: project.demoUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      views: project.views, // Include views from domain entity
    };
  }

  static toDtoArray(projects: Project[]): ProjectResponseDto[] {
    return projects.map((project) => this.toDto(project));
  }
}
