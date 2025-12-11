# NestJS Clean Architecture

This project demonstrates Clean Architecture principles with NestJS.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)

- **Entities**: Pure business objects with business logic
- **Repository Interfaces**: Contracts for data access
- **NO dependencies** on infrastructure, frameworks, or external libraries
- Contains core business rules

### 2. Application Layer (`src/application/`)

- **Use Cases**: Orchestrate business logic
- **DTOs**: Data transfer objects
- Depends **ONLY** on domain layer
- Framework-agnostic business logic

### 3. Infrastructure Layer (`src/infrastructure/`)

- **Repository Implementations**: Database access, external services
- **Database Configuration**: ORM setup, connections
- Implements domain interfaces (Dependency Inversion Principle)
- Contains framework-specific code

### 4. Interface Layer (`src/interface/`)

- **Controllers**: HTTP endpoints, GraphQL resolvers
- **Mappers**: Convert between entities and DTOs
- Presentation layer
- Handles user input/output

## Dependency Rule

**Dependencies point INWARD only:**

```
Interface → Application → Domain
Infrastructure → Domain
```

The domain layer has **NO knowledge** of outer layers.

## Clean Architecture Benefits

✅ **Testability**: Business logic isolated from frameworks  
✅ **Maintainability**: Clear separation of concerns  
✅ **Flexibility**: Easy to swap implementations (e.g., database)  
✅ **Independence**: Domain logic doesn't depend on infrastructure

## Dependency Injection (DI) Approach

This project uses NestJS's built-in Dependency Injection container to implement the Dependency Inversion Principle.

### How it works:

1. **Domain Layer** defines repository interfaces (e.g., `IUserRepository`)
2. **Infrastructure Layer** implements these interfaces (e.g., `PrismaUserRepository`)
3. **Application Layer** depends on interfaces via constructor injection
4. **app.module.ts** binds interfaces to concrete implementations:

```typescript
providers: [
  {
    provide: USER_REPOSITORY, // Interface token (Symbol)
    useClass: PrismaUserRepository, // Concrete implementation
  },
];
```

### Benefits:

- **Loose Coupling**: Use cases don't know about Prisma, PostgreSQL, or any infrastructure
- **Testability**: Easy to mock repositories in unit tests
- **Flexibility**: Swap `PrismaUserRepository` with `MongoUserRepository` without changing use cases

## Import Rules by Layer

| Layer              | Can Import From             | Examples                                                         |
| ------------------ | --------------------------- | ---------------------------------------------------------------- |
| **Domain**         | Nothing (pure TypeScript)   | No imports from `@nestjs`, `@prisma/client`, or external libs    |
| **Application**    | Domain only                 | Can import entities, repository interfaces                       |
| **Infrastructure** | Domain + External libraries | Can import domain interfaces, `@prisma/client`, `@nestjs/common` |
| **Interface**      | Application + Domain        | Can import use cases, DTOs, entities                             |

### Violation Examples:

❌ **WRONG**: Domain importing from Prisma

```typescript
// domain/entities/user.entity.ts
import { User as PrismaUser } from '@prisma/client'; // ❌ VIOLATION
```

✅ **CORRECT**: Infrastructure importing from Domain

```typescript
// infrastructure/mappers/user-persistence.mapper.ts
import { User as PrismaUser } from '@prisma/client'; // ✅ OK (infrastructure)
import { User } from '../../domain/entities/user.entity'; // ✅ OK (domain)
```

## Repository Pattern Explanation

The **Repository Pattern** abstracts data access logic and provides a clean interface for the domain layer.

### Structure:

1. **Interface in Domain Layer**:

   ```typescript
   // domain/repositories/user.repository.interface.ts
   export interface IUserRepository {
     findById(id: string): Promise<User | null>;
     save(user: User): Promise<User>;
   }
   ```

2. **Implementation in Infrastructure Layer**:

   ```typescript
   // infrastructure/repositories/user.repository.ts
   @Injectable()
   export class PrismaUserRepository implements IUserRepository {
     constructor(private prisma: PrismaService) {}

     async findById(id: string): Promise<User | null> {
       const prismaUser = await this.prisma.user.findUnique({ where: { id } });
       return UserPersistenceMapper.toDomain(prismaUser);
     }
   }
   ```

3. **Dependency Injection in NestJS**:

   ```typescript
   // app.module.ts
   providers: [
     {
       provide: USER_REPOSITORY,
       useClass: PrismaUserRepository,
     },
   ];
   ```

4. **Usage in Application Layer**:
   ```typescript
   // application/usecases/create-user.usecase.ts
   export class CreateUserUseCase {
     constructor(
       @Inject(USER_REPOSITORY)
       private readonly userRepository: IUserRepository, // ✅ Depends on interface
     ) {}
   }
   ```

### Benefits:

- **Abstraction**: Use cases don't know if data comes from Prisma, MongoDB, or in-memory
- **Testing**: Easy to create mock repositories
- **Swappable**: Change database without touching business logic

## Running the Application

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

- `GET /health` - Health check endpoint
