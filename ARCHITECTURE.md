# System Architecture

## Overview

This portfolio system follows **Clean Architecture** principles with clear separation between layers and unidirectional dependencies.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)               │
│   - Server Components (data fetching)              │
│   - Client Components (interactivity)              │
│   - React Query (state management)                 │
└─────────────────────────────────────────────────────┘
                         ↓ HTTP
         ┌───────────────────────────────┐
         │      Nginx (Reverse Proxy)    │
         │   - Routing                   │
         │   - Load balancing            │
         │   - SSL termination           │
         └───────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│               Backend API (NestJS)                  │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │         Interface Layer                     │  │
│   │   (Controllers, Guards, Interceptors)       │  │
│   └─────────────────────────────────────────────┘  │
│                       ↓                             │
│   ┌─────────────────────────────────────────────┐  │
│   │       Application Layer                     │  │
│   │   (Use Cases, DTOs, Business Logic)         │  │
│   └─────────────────────────────────────────────┘  │
│                       ↓                             │
│   ┌─────────────────────────────────────────────┐  │
│   │      Infrastructure Layer                   │  │
│   │   (Repositories, Cache, Auth, External)     │  │
│   └─────────────────────────────────────────────┘  │
│                       ↓                             │
│   ┌─────────────────────────────────────────────┐  │
│   │          Domain Layer                       │  │
│   │   (Entities, Value Objects, Interfaces)     │  │
│   └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
          ↓                           ↓
    ┌──────────┐              ┌──────────┐
    │PostgreSQL│              │  Redis   │
    │(Database)│              │ (Cache)  │
    └──────────┘              └──────────┘
```

## Clean Architecture Layers

### 1. Domain Layer (Innermost)

**Location**: `portfolio-backend/src/domain/`

**Responsibility**: Core business entities and rules

```
domain/
├── entities/           # Business entities (User, Project, Comment)
├── enums/              # Domain enums (Role)
└── repositories/       # Repository interfaces (contracts)
```

**Dependencies**: NONE - Pure business logic

**Key Principle**: Domain layer knows nothing about databases, HTTP, or frameworks

### 2. Application Layer

**Location**: `portfolio-backend/src/application/`

**Responsibility**: Orchestrate business workflows

```
application/
├── use-cases/          # Business logic orchestration
│   ├── get-project-by-slug.usecase.ts
│   ├── increment-view.usecase.ts
│   └── ...
└── dtos/               # Data Transfer Objects
```

**Dependencies**: Domain layer only

**Key Principle**: Use cases coordinate domain entities without knowing about HTTP or databases

### 3. Infrastructure Layer

**Location**: `portfolio-backend/src/infrastructure/`

**Responsibility**: External integrations and frameworks

```
infrastructure/
├── database/           # Prisma configuration
├── repositories/       # Repository implementations
├── cache/              # Redis caching
│   ├── redis-cache.service.ts
│   ├── cache.interceptor.ts      # Auto-caching GET requests
│   └── cache-invalidation.service.ts
├── auth/               # JWT strategies, guards
├── rate-limiter/       # Redis-based rate limiting
├── logging/           # Structured logger
└── observability/      # Sentry configuration
```

**Dependencies**: All inner layers

**Key Principle**: Implements interfaces defined in domain/application layers

### 4. Interface Layer (Outermost)

**Location**: `portfolio-backend/src/interface/`

**Responsibility**: HTTP handling and external communication

```
interface/
├── controllers/        # REST API endpoints
├── mappers/            # Entity ↔ DTO conversion
└── modules/            # Feature modules (Auth, Admin)
```

**Dependencies**: All inner layers

**Key Principle**: Translates HTTP requests to use case calls

## Data Flow

### Read Flow (with Caching)

```
1. HTTP GET /api/projects/123
         ↓
2. ProjectsController.findOne(id)
         ↓
3. CacheInterceptor checks Redis
         ↓ (cache miss)
4. GetProjectByIdUseCase.execute(id)
         ↓
5. ProjectRepository.findById(id)
         ↓
6. Prisma query → PostgreSQL
         ↓
7. Entity returned to use case
         ↓
8. Mapper converts Entity → DTO
         ↓
9. CacheInterceptor stores in Redis (TTL: 120s)
         ↓
10. Response sent to client
```

### Write Flow (with Cache Invalidation)

```
1. HTTP PUT /api/projects/123
         ↓
2. ProjectsController.update(id, dto)
         ↓
3. UpdateProjectUseCase.execute(id, data)
         ↓
4. ProjectRepository.update(id, data)
         ↓
5. Prisma mutation → PostgreSQL
         ↓
6. CacheInvalidationService.invalidateProject(id)
         ↓
7. Redis KEYS pattern match + DEL
         ↓
8. Updated entity returned
         ↓
9. Response sent to client
```

## Authentication Architecture

### Token Strategy

```
┌──────────────┐
│    Client    │
└──────────────┘
       ↓ POST /auth/login
┌──────────────────────────────────┐
│  AuthController                  │
│  - Validates credentials         │
│  - Generates tokens              │
│  - Sets HttpOnly cookies         │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  Response:                       │
│  - Body: { accessToken, user }   │
│  - Cookies:                      │
│    • accessToken (HttpOnly)      │
│    • refreshToken (HttpOnly)     │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  Protected Request               │
│  Authorization: Bearer <token>   │
│  OR Cookieautomatically sent     │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  JwtStrategy                     │
│  - Validates token               │
│  - Extracts payload              │
│  - Attaches user to request      │
└──────────────────────────────────┘
```

### Security Features

- ✅ HttpOnly cookies (XSS protection)
- ✅ CSRF protection (SameSite=Lax)
- ✅ Refresh token rotation
- ✅ Token expiry (15min access, 7d refresh)
- ✅ Role-based access control (RBAC)

## Caching Strategy

### Cache-Aside Pattern

```typescript
// Automatic caching via interceptor
@UseInterceptors(CacheInterceptor)
@Get(':id')
async findOne(@Param('id') id: string) {
  // Interceptor checks cache first
  // If miss, fetches from DB and caches
  return this.useCase.execute(id);
}
```

### Cache Invalidation

```typescript
// Automatic invalidation after mutations
@Post()
async create(@Body() dto: CreateProjectDto) {
  const project = await this.useCase.execute(dto);

  // Invalidates all related cache keys
  await this.cacheInvalidation.invalidateProjects();

  return project;
}
```

### Cache Keys Pattern

```
cache:projects:list:*           # List queries
cache:projects:item:${id}       # Single item
cache:projects:user:${userId}   # User's projects
```

### TTL Configuration

| Endpoint                   | TTL  | Rationale                    |
| -------------------------- | ---- | ---------------------------- |
| GET /projects              | 60s  | List changes frequently      |
| GET /projects/:id          | 120s | Individual items more stable |
| GET /projects/user/:userId | 60s  | User content may update      |

## Frontend Architecture

### Server vs Client Components

```
app/
├── layout.tsx                 # Server Component
├── page.tsx                   # Server Component
│
├── projects/
│   ├── [slug]/
│   │   ├── page.tsx          # Server (SSR, metadata)
│   │   └── ProjectDetailContent.tsx  # Client (interactivity)
│
└── dashboard/
    ├── page.tsx               # Server (auth check)
    └── ProjectsTable.tsx      # Client (CRUD actions)
```

**Pattern**: Fetch data in Server Components, delegate interactivity to Client Components

### React Query Integration

```typescript
// Custom hook (client-side)
function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectService.getById(id),
    staleTime: 60_000, // Consider fresh for 60s
    cacheTime: 300_000, // Keep in cache for 5min
  });
}

// Optimistic updates
function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.update,
    onMutate: async (data) => {
      // Optimistic update
      await queryClient.cancelQueries(["projects", data.id]);
      const previous = queryClient.getQueryData(["projects", data.id]);
      queryClient.setQueryData(["projects", data.id], data);
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(["projects", variables.id], context.previous);
    },
    onSettled: () => {
      // Refetch to sync
      queryClient.invalidateQueries(["projects"]);
    },
  });
}
```

## Database Schema

### Core Entities

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(VIEWER)

  projects  Project[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Project {
  id               String   @id @default(cuid())
  slug             String   @unique
  title            String
  content          String
  techStack        String[]
  views            Int      @default(0)
  version          Int      @default(1) // Optimistic locking

  userId           String
  user             User     @relation(fields: [userId], references: [id])

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([userId])
  @@index([slug])
}
```

### Concurrency Control

**Optimistic Locking**: Uses `version` field to prevent lost updates

```typescript
// Increment version on update
const updated = await prisma.project.update({
  where: { id, version },
  data: { ...data, version: { increment: 1 } },
});

// If version doesn't match, throws error
```

## Observability

### Structured Logging

```json
{
  "timestamp": "2025-12-26T10:30:00.000Z",
  "level": "info",
  "message": "Project created",
  "context": "CreateProjectUseCase",
  "userId": "usr_123",
  "projectId": "prj_456"
}
```

### Sentry Integration

- **Backend**: Captures unhandled exceptions, 500 errors
- **Frontend**: Captures React errors, network failures
- **User Context**: Attaches userId (no PII)
- **Filtering**: Skips 404s and validation errors

## Design Patterns

| Pattern     | Usage                        | Location                          |
| ----------- | ---------------------------- | --------------------------------- |
| Repository  | Data access abstraction      | `infrastructure/repositories/`    |
| Use Case    | Business logic orchestration | `application/use-cases/`          |
| DTO         | Data transfer                | `application/dtos/`               |
| Mapper      | Entity ↔ DTO conversion      | `interface/mappers/`              |
| Interceptor | Cross-cutting concerns       | `infrastructure/cache/`           |
| Guard       | Authorization                | `infrastructure/auth/`            |
| Strategy    | JWT validation               | `infrastructure/auth/strategies/` |

## Dependency Rule

```
Domain ← Application ← Infrastructure ← Interface
   ↑                                        ↓
   └────────────────────────────────────────┘
            (Dependency Inversion)
```

**Core Principle**: Dependencies point INWARD. Outer layers depend on inner layers, never the reverse.

## Performance Optimizations

1. **Redis Caching** - Reduces database load by 80%+
2. **Connection Pooling** - Prisma connection pool (10 connections)
3. **Index Optimization** - Database indexes on frequently queried fields
4. **React Query** - Client-side caching, deduplication
5. **Next.js SSR** - Server-side rendering for initial load
6. **Lazy Loading** - Code splitting for client components

## Security Architecture

1. **Input Validation** - class-validator DTOs
2. **SQL Injection** - Prisma ORM (parameterized queries)
3. **XSS Protection** - React auto-escaping + HttpOnly cookies
4. **CSRF Protection** - SameSite cookies
5. **Rate Limiting** - Redis-based throttling
6. **PII Protection** - Automatic sanitization in logs

---

**For implementation details, see respective README files in `/portfolio-backend` and `/portfolio-frontend`**
