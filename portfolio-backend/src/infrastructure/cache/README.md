# Redis Caching Module for NestJS

A production-ready Redis caching implementation following Clean Architecture principles and the cache-aside pattern.

## 📦 Features

- ✅ **Cache-aside pattern** - Automatic GET request caching
- ✅ **Clean Architecture** - Infrastructure concerns separated from business logic
- ✅ **Dependency Injection** - Proper NestJS DI usage
- ✅ **Graceful degradation** - App continues to work if Redis fails
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Configurable TTL** - Default 60 seconds, customizable
- ✅ **Pattern-based invalidation** - Delete multiple keys at once
- ✅ **Health checks** - Built-in Redis connectivity checks
- ✅ **Detailed logging** - Debug cache hits/misses

## 📂 File Structure

```
src/infrastructure/cache/
├── redis-cache.service.ts   # Core cache operations (get, set, del)
├── cache.interceptor.ts     # Automatic GET request caching
└── cache.module.ts          # Module configuration
```

## 🚀 Installation

### 1. Install Dependencies

```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Redis Configuration (optional - defaults shown)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Import CacheModule

In your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from './infrastructure/cache/cache.module';

@Module({
  imports: [
    CacheModule, // ← Add this (it's a global module)
    // ... your other modules
  ],
})
export class AppModule {}
```

## 📖 Usage

### Automatic Caching with Interceptor

Apply `@UseInterceptors(CacheInterceptor)` to any GET endpoint:

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '../../infrastructure/cache/cache.interceptor';

@Controller('projects')
export class ProjectController {
  @Get('user/:userId')
  @UseInterceptors(CacheInterceptor) // ← Automatically caches for 60s
  async findByUser(@Param('userId') userId: string) {
    // This will only execute if cache miss
    return await this.getProjectsUseCase.execute(userId);
  }
}
```

**How it works:**

1. First request: Executes handler, caches result for 60s
2. Subsequent requests: Returns cached data instantly
3. After 60s: Cache expires, next request executes handler again

### Manual Cache Operations

Inject `RedisCacheService` for manual cache control:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../../infrastructure/cache/redis-cache.service';

@Injectable()
export class SomeService {
  constructor(private readonly cacheService: RedisCacheService) {}

  async getData(key: string): Promise<any> {
    // Try to get from cache
    const cached = await this.cacheService.get(key);
    if (cached) return cached;

    // On cache miss, fetch from source
    const data = await this.fetchFromDatabase();

    // Store in cache for 120 seconds
    await this.cacheService.set(key, data, 120);

    return data;
  }
}
```

### Cache Invalidation Pattern

**Clean Architecture Rule:** Controllers handle cache invalidation, NOT use cases.

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { RedisCacheService } from '../../infrastructure/cache/redis-cache.service';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly cacheService: RedisCacheService, // ← Inject cache service
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    // Execute business logic (use case)
    const project = await this.createProjectUseCase.execute(dto);

    // Invalidate related caches (infrastructure concern)
    await this.cacheService.del(`cache:/projects/user/${dto.userId}`);

    return project;
  }
}
```

## 🔧 API Reference

### RedisCacheService

#### `get<T>(key: string): Promise<T | null>`

Get cached value by key.

```typescript
const user = await cacheService.get<User>('user:123');
```

#### `set(key: string, value: unknown, ttlSeconds?: number): Promise<void>`

Set cache value with TTL (default: 60 seconds).

```typescript
await cacheService.set('user:123', userData, 300); // 5 minutes
```

#### `del(key: string): Promise<number>`

Delete single cache entry.

```typescript
await cacheService.del('user:123');
```

#### `delByPattern(pattern: string): Promise<number>`

Delete multiple entries matching pattern.

```typescript
// Delete all project caches
await cacheService.delByPattern('cache:/projects/*');

// Delete all caches for a specific user
await cacheService.delByPattern('cache:*:user:123');
```

#### `isHealthy(): Promise<boolean>`

Check Redis connection status.

```typescript
const healthy = await cacheService.isHealthy();
```

### CacheInterceptor

Automatically applied to GET requests only.

**Cache Key Format:** `cache:{request.url}`

**Examples:**

- `GET /projects/user/123` → `cache:/projects/user/123`
- `GET /projects/user/123?sort=desc` → `cache:/projects/user/123?sort=desc`

## 🎯 Best Practices

### 1. Cache Only GET Requests

The interceptor automatically skips non-GET requests:

```typescript
@Get()
@UseInterceptors(CacheInterceptor)  // ✅ Will cache
async findAll() { ... }

@Post()
@UseInterceptors(CacheInterceptor)  // ✅ Will skip caching
async create() { ... }
```

### 2. Invalidate on Mutations

Always invalidate related caches after CREATE/UPDATE/DELETE:

```typescript
@Put(':id')
async update(@Param('id') id: string, @Body() dto: UpdateDto) {
  const entity = await this.updateUseCase.execute(id, dto);

  // Invalidate specific cache
  await this.cacheService.del(`cache:/entities/${id}`);

  // Invalidate list caches
  await this.cacheService.del(`cache:/entities/user/${entity.userId}`);

  return entity;
}
```

### 3. Use Descriptive Cache Keys

Choose keys that match your API routes:

```typescript
// ✅ Good - matches route structure
cache: /projects/ersu / 123;
cache: /users/123 / profile;

// ❌ Bad - unclear mapping
cache: projects_123;
cache: u_123_p;
```

### 4. Don't Cache in Use Cases

Use cases should NOT know about caching:

```typescript
// ❌ Bad - violates Clean Architecture
export class GetUserUseCase {
  constructor(private cache: RedisCacheService) {} // ❌ Infrastructure in use case

  async execute(id: string) {
    const cached = await this.cache.get(`user:${id}`); // ❌
    // ...
  }
}

// ✅ Good - caching in controller (interface layer)
@Controller('users')
export class UserController {
  constructor(
    private getUserUseCase: GetUserUseCase,
    private cacheService: RedisCacheService, // ✅
  ) {}

  @Get(':id')
  @UseInterceptors(CacheInterceptor) // ✅ Or use interceptor
  async getUser(@Param('id') id: string) {
    return await this.getUserUseCase.execute(id);
  }
}
```

## 🐳 Running Redis Locally

### Using Docker

```bash
# Start Redis
docker run -d --name redis -p 6379:6379 redis:alpine

# Check Redis logs
docker logs redis

# Stop Redis
docker stop redis
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    container_name: profolio-redis
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

```bash
docker-compose up -d redis
```

## 🧪 Testing Cache Behavior

### 1. Test Cache Hit

```bash
# First request - cache miss (slower)
curl http://localhost:3000/projects/user/123

# Second request - cache hit (faster)
curl http://localhost:3000/projects/user/123
```

### 2. Monitor Redis Keys

```bash
# Connect to Redis CLI
docker exec -it redis redis-cli

# List all cache keys
redis> KEYS cache:*

# View specific key
redis> GET "cache:/projects/user/123"

# Check TTL (time to live)
redis> TTL "cache:/projects/user/123"
```

### 3. Test Cache Invalidation

```bash
# Create a project (should invalidate cache)
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{"userId":"123","title":"Test"}'

# Verify cache was deleted in Redis CLI
redis> EXISTS "cache:/projects/user/123"
# Should return 0 (deleted)
```

## ⚠️ Important Notes

### Graceful Failure

The cache service is designed to fail gracefully:

```typescript
// If Redis is down, the app continues to work normally
const data = await cacheService.get('key'); // Returns null instead of throwing
await cacheService.set('key', value); // Logs error, doesn't throw
```

### Memory Considerations

Redis stores everything in memory. Monitor usage:

```bash
# Check Redis memory usage
redis-cli INFO memory
```

### Cache Stampede Protection

For high-traffic endpoints, consider implementing cache warming or using a distributed lock to prevent cache stampede.

## 🚀 Production Checklist

- [ ] Set appropriate TTL values for your use case
- [ ] Configure Redis persistence (RDB/AOF)
- [ ] Set up Redis memory limits and eviction policies
- [ ] Enable Redis authentication (`REDIS_PASSWORD`)
- [ ] Use Redis Sentinel or Cluster for high availability
- [ ] Monitor cache hit/miss rates
- [ ] Set up alerting for Redis connection failures
- [ ] Configure proper retry strategies
- [ ] Document cache invalidation patterns for your team

## 📝 License

Part of the Profolio project.
