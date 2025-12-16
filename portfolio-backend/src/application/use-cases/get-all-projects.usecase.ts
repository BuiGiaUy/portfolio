import { Injectable, Inject } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../domain/repositories/project.repository.interface';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { Project } from '../../domain/entities/project.entity';

/**
 * Get All Projects Use Case
 *
 * Fetches all projects from the repository.
 * Useful for public portfolio display.
 */
@Injectable()
export class GetAllProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }
}
