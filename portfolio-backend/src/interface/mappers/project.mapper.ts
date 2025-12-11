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
      description: project.description,
      userId: project.userId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  static toDtoArray(projects: Project[]): ProjectResponseDto[] {
    return projects.map((project) => this.toDto(project));
  }
}
