import { Inject, Injectable } from '@nestjs/common';
import * as projectRepositoryInterface from '../../domain/repositories/project.repository.interface';
import { Project } from '../../domain/entities/project.entity';

/**
 * Application Layer Use Case
 *
 * This use case retrieves all projects for a specific user.
 * It depends ONLY on the domain layer (entities and repository interfaces).
 */
@Injectable()
export class GetProjectsByUserUseCase {
  constructor(
    @Inject(projectRepositoryInterface.PROJECT_REPOSITORY)
    private readonly projectRepository: projectRepositoryInterface.IProjectRepository,
  ) {}

  async execute(userId: string): Promise<Project[]> {
    return await this.projectRepository.findByUserId(userId);
  }
}
