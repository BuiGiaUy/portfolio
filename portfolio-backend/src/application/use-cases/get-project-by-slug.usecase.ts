import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import {
  IProjectRepository,
  PROJECT_REPOSITORY,
} from '../../domain/repositories/project.repository.interface';

/**
 * Get Project By Slug Use Case
 *
 * Application layer use case for fetching a single project by its SEO-friendly slug.
 * Used primarily for:
 * - Server-side metadata generation (SEO)
 * - OG image generation
 * - Sitemap generation
 *
 * CLEAN ARCHITECTURE COMPLIANCE:
 * ✓ NO PrismaService import
 * ✓ Depends ONLY on IProjectRepository (domain interface)
 */
@Injectable()
export class GetProjectBySlugUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
  ) {}

  /**
   * Execute the use case
   *
   * @param slug - SEO-friendly slug of the project
   * @returns Promise<Project> - The found project as a domain entity
   * @throws NotFoundException if project is not found
   */
  async execute(slug: string): Promise<Project> {
    const project = await this.projectRepository.findBySlug(slug);

    if (!project) {
      throw new NotFoundException(`Project with slug '${slug}' not found`);
    }

    return project;
  }
}
