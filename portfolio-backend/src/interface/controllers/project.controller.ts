import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.usecase';
import { GetAllProjectsUseCase } from '../../application/use-cases/get-all-projects.usecase';
import { GetProjectsByUserUseCase } from '../../application/use-cases/get-projects-by-user.usecase';
import { GetProjectUseCase } from '../../application/use-cases/get-project.usecase';
import { UpdateProjectDetailsUseCase } from '../../application/use-cases/update-project-details.usecase';
import { DeleteProjectUseCase } from '../../application/use-cases/delete-project.usecase';
import { IncrementProjectViewPessimisticUseCase } from '../../application/use-cases/increment-project-view-pessimistic.usecase';
import { IncrementProjectViewOptimisticUseCase } from '../../application/use-cases/increment-project-view-optimistic.usecase';
import {
  CreateProjectDto,
  ProjectResponseDto,
} from '../../application/dtos/project.dto';
import { UpdateProjectDetailsDto } from '../../application/dtos/update-project.input';
import { ProjectMapper } from '../mappers/project.mapper';
import { CacheInterceptor } from '../../infrastructure/cache/cache.interceptor';
import { CacheInvalidationService } from '../../infrastructure/cache/cache-invalidation.service';
import { CacheTTL } from '../../infrastructure/cache/cache-ttl.decorator';

/**
 * Project Controller
 *
 * Interface layer controller handling HTTP requests for project resources.
 * Delegates business logic to use cases and maps responses to DTOs.
 *
 * Caching Strategy:
 * - GET endpoints: Automatic caching via CacheInterceptor (configurable TTL)
 * - POST/PUT/DELETE: Cache invalidation via CacheInvalidationService
 *
 * Cache Invalidation Patterns:
 * - POST create: cache:/projects/user/{userId}*
 * - PUT update: cache:/projects/{id}*, cache:/projects/user/{userId}*
 * - DELETE: cache:/projects/{id}*, cache:/projects/user/{userId}*
 * - POST view: cache:/projects/{id}*
 */
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
    private readonly getProjectsByUserUseCase: GetProjectsByUserUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly updateProjectDetailsUseCase: UpdateProjectDetailsUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly incrementProjectViewPessimisticUseCase: IncrementProjectViewPessimisticUseCase,
    private readonly incrementProjectViewOptimisticUseCase: IncrementProjectViewOptimisticUseCase,
    private readonly cacheInvalidationService: CacheInvalidationService,
  ) {}

  /**
   * Create a new project
   *
   * Cache Strategy:
   * - Invalidates user's project list cache after successful creation
   * - Ensures GET endpoints return fresh data including the new project
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateProjectDto, @Request() req: any): Promise<ProjectResponseDto> {
    const userId = req.user.userId;
    
    const project = await this.createProjectUseCase.execute({
      ...dto,
      userId,
    });

    // Invalidate project list caches
    await this.cacheInvalidationService.invalidateOnCreate(userId);

    return ProjectMapper.toDto(project);
  }

  /**
   * Get all projects
   *
   * Cache Strategy:
   * - Automatically cached by CacheInterceptor for 60 seconds
   * - Cache key format: cache:/projects
   * - Public endpoint for portfolio display
   */
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  async findAll(): Promise<ProjectResponseDto[]> {
    const projects = await this.getAllProjectsUseCase.execute();
    return ProjectMapper.toDtoArray(projects);
  }

  /**
   * Get a single project by ID
   *
   * Cache Strategy:
   * - Automatically cached by CacheInterceptor for 120 seconds
   * - Cache key format: cache:/projects/{id}
   */
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(120)
  async findOne(@Param('id') id: string): Promise<ProjectResponseDto> {
    const project = await this.getProjectUseCase.execute(id);
    return ProjectMapper.toDto(project);
  }

  /**
   * Get all projects for a specific user
   *
   * Cache Strategy:
   * - Automatically cached by CacheInterceptor for 60 seconds
   * - Cache key format: cache:/projects/user/{userId}
   * - Cache invalidated on create/update/delete operations
   */
  @Get('user/:userId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  async findByUser(
    @Param('userId') userId: string,
  ): Promise<ProjectResponseDto[]> {
    const projects = await this.getProjectsByUserUseCase.execute(userId);
    return ProjectMapper.toDtoArray(projects);
  }

  /**
   * Update project details
   *
   * Cache Strategy:
   * - Invalidates project-specific cache
   * - Invalidates user's project list cache
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDetailsDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.updateProjectDetailsUseCase.execute({
      id,
      projectData: {
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        content: dto.content,
        techStack: dto.techStack,
        thumbnailUrl: dto.thumbnailUrl,
        githubUrl: dto.githubUrl,
        demoUrl: dto.demoUrl,
      },
      statsData: dto.stats,
    });

    // Invalidate caches
    await this.cacheInvalidationService.invalidateOnUpdate(id, project.userId);

    return ProjectMapper.toDto(project);
  }

  /**
   * Delete a project
   *
   * Cache Strategy:
   * - Invalidates project-specific cache
   * - Invalidates user's project list cache
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    const { userId } = await this.deleteProjectUseCase.execute(id);

    // Invalidate caches
    await this.cacheInvalidationService.invalidateOnDelete(id, userId);
  }

  /**
   * Increment project view count using pessimistic locking
   * Uses SELECT ... FOR UPDATE to prevent lost updates
   *
   * Cache Strategy:
   * - Invalidates project-specific cache after view increment
   */
  @Post(':id/view-pessimistic')
  @HttpCode(204)
  async incrementViewPessimistic(@Param('id') id: string): Promise<void> {
    await this.incrementProjectViewPessimisticUseCase.execute(id);

    // Invalidate project cache
    await this.cacheInvalidationService.invalidateOnViewIncrement(id);
  }

  /**
   * Increment project view count using optimistic locking
   * Uses version column with automatic retry on conflicts
   *
   * Cache Strategy:
   * - Invalidates project-specific cache after view increment
   */
  @Post(':id/view-optimistic')
  @HttpCode(204)
  async incrementViewOptimistic(@Param('id') id: string): Promise<void> {
    await this.incrementProjectViewOptimisticUseCase.execute(id);

    // Invalidate project cache
    await this.cacheInvalidationService.invalidateOnViewIncrement(id);
  }
}
