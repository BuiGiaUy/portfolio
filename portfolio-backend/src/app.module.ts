import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Interface Layer
import { HealthController } from './interface/controllers/health.controller';
import { UserController } from './interface/controllers/user.controller';
import { ProjectController } from './interface/controllers/project.controller';
import { CommentController } from './interface/controllers/comment.controller';
import { AuthModule } from './interface/modules/auth.module';
import { AdminModule } from './interface/modules/admin.module';

// Application Layer
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { CreateProjectUseCase } from './application/use-cases/create-project.usecase';
import { CreateCommentUseCase } from './application/use-cases/create-comment.usecase';
import { GetAllProjectsUseCase } from './application/use-cases/get-all-projects.usecase';
import { GetProjectsByUserUseCase } from './application/use-cases/get-projects-by-user.usecase';
import { GetCommentsByProjectUseCase } from './application/use-cases/get-comments-by-project.usecase';
import { GetProjectUseCase } from './application/use-cases/get-project.usecase';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.usecase';
import { UpdateProjectDetailsUseCase } from './application/use-cases/update-project-details.usecase';
import { IncrementProjectViewPessimisticUseCase } from './application/use-cases/increment-project-view-pessimistic.usecase';
import { IncrementProjectViewOptimisticUseCase } from './application/use-cases/increment-project-view-optimistic.usecase';

// Infrastructure Layer
import { PrismaService } from './infrastructure/database/prisma.service';
import { PrismaUserRepository } from './infrastructure/repositories/user.repository';
import { PrismaProjectRepository } from './infrastructure/repositories/project.repository';
import { PrismaCommentRepository } from './infrastructure/repositories/comment.repository';
import { CacheModule } from './infrastructure/cache/cache.module';
import { RateLimiterService } from './infrastructure/rate-limiter/rate-limiter.service';
import { CacheInvalidationService } from './infrastructure/cache/cache-invalidation.service';

// Domain Layer
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { PROJECT_REPOSITORY } from './domain/repositories/project.repository.interface';
import { COMMENT_REPOSITORY } from './domain/repositories/comment.repository.interface';

/**
 * Root Application Module
 *
 * This module demonstrates Clean Architecture principles:
 *
 * 1. DOMAIN LAYER (innermost):
 *    - Entities: Pure business objects (User)
 *    - Repository Interfaces: Contracts for data access
 *    - NO dependencies on outer layers
 *
 * 2. APPLICATION LAYER:
 *    - Use Cases: Business logic orchestration (CreateUserUseCase)
 *    - DTOs: Data transfer objects
 *    - Depends ONLY on domain layer
 *
 * 3. INFRASTRUCTURE LAYER:
 *    - Repository Implementations: Database access (UserInMemoryRepository)
 *    - Implements domain interfaces (Dependency Inversion)
 *
 * 4. INTERFACE LAYER (outermost):
 *    - Controllers: HTTP endpoints (HealthController)
 *    - Mappers: Entity <-> DTO conversion
 *
 * Dependency Rule: Dependencies point INWARD only.
 * Domain has NO knowledge of infrastructure or interface layers.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule,
    AuthModule,
    AdminModule,
  ],
  controllers: [
    AppController,
    HealthController,
    UserController,
    ProjectController,
    CommentController,
  ],
  providers: [
    AppService,
    PrismaService,
    // Application Layer Use Cases
    CreateUserUseCase,
    CreateProjectUseCase,
    CreateCommentUseCase,
    GetAllProjectsUseCase,
    GetProjectUseCase,
    GetProjectsByUserUseCase,
    GetCommentsByProjectUseCase,
    UpdateProjectDetailsUseCase,
    DeleteProjectUseCase,
    IncrementProjectViewPessimisticUseCase,
    IncrementProjectViewOptimisticUseCase,
    
    // Cache Invalidation
    CacheInvalidationService,
    // Infrastructure Layer - Rate Limiter
    RateLimiterService,
    // Infrastructure Layer - Bind interfaces to implementations
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
    {
      provide: COMMENT_REPOSITORY,
      useClass: PrismaCommentRepository,
    },
  ],
})
export class AppModule {}
