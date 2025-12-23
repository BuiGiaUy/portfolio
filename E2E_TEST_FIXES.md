# E2E Test Fixes

## Overview

This document details the fixes applied to resolve e2e test failures in the portfolio backend.

## Issues Identified

### 1. Module Resolution Error

**Problem**: Jest could not locate modules with `src/` prefix

```
Could not locate module src/application/dto/auth/login.dto mapped as:
D:\Project\portfolio\portfolio-backend\tests\src\$1
```

**Root Cause**: The `moduleNameMapper` in `jest-e2e.json` was incorrectly configured. With `rootDir: ".."`, the mapper `"^src/(.*)$": "<rootDir>/src/$1"` resolved to `tests/src/$1` instead of the project root's `src/$1`.

**Fix**: Updated `jest-e2e.json` to use correct path resolution:

```json
{
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
```

### 2. RateLimiterService Dependency Injection Error

**Problem**: E2e tests failed with dependency injection error:

```
Nest can't resolve dependencies of the RateLimiterService (?, Object)
```

**Root Cause**: `RateLimiterService` was registered as a simple provider in `AppModule`, but its constructor expects optional `RateLimiterConfig` and `Redis` parameters. When NestJS tried to inject dependencies, it couldn't resolve the first parameter.

**Fix**: Converted `RateLimiterService` to a factory provider in `AppModule`:

```typescript
{
  provide: RateLimiterService,
  useFactory: (configService: ConfigService) => {
    const config = {
      limit: configService.get<number>('RATE_LIMIT_MAX', 100),
      windowSeconds: configService.get<number>('RATE_LIMIT_WINDOW_SECONDS', 900),
    };
    return new RateLimiterService(config);
  },
  inject: [ConfigService],
}
```

### 3. Prisma Schema Mismatch

**Problem**: E2e test tried to create user with `name` field:

```typescript
const testUser = await prisma.user.create({
  data: {
    email: `test-${Date.now()}@example.com`,
    name: "Test User", // ❌ Field doesn't exist
    passwordHash: "hashed_password",
  },
});
```

**Root Cause**: The Prisma schema doesn't have a `name` field in the `User` model.

**Fix**: Updated test to match actual schema:

```typescript
const testUser = await prisma.user.create({
  data: {
    email: `test-${Date.now()}@example.com`,
    passwordHash: "hashed_password",
    role: "VIEWER",
    active: true,
  },
});
```

### 4. Supertest Import Error

**Problem**: Tests failed with `TypeError: request is not a function`

**Root Cause**: Incorrect import syntax for supertest:

```typescript
import * as request from "supertest"; // ❌ Wrong
```

**Fix**: Use default import:

```typescript
import request from "supertest"; // ✅ Correct
```

### 5. Foreign Key Constraint Violation

**Problem**: Cleanup in `afterAll` failed:

```
Foreign key constraint violated on the constraint: `Project_userId_fkey`
```

**Root Cause**: Trying to delete users before deleting their associated projects violated the foreign key constraint.

**Fix**: Delete projects first, then users:

```typescript
afterAll(async () => {
  // Delete projects first due to foreign key constraint
  await prisma.project.deleteMany({
    where: {
      userId: {
        in: await prisma.user
          .findMany({
            where: { email: { contains: "test-" } },
            select: { id: true },
          })
          .then((users) => users.map((u) => u.id)),
      },
    },
  });
  // Then delete users
  await prisma.user.deleteMany({
    where: { email: { contains: "test-" } },
  });

  await app.close();
});
```

## Files Modified

1. **`tests/e2e/jest-e2e.json`**

   - Fixed `moduleNameMapper` path resolution

2. **`src/app.module.ts`**

   - Added `ConfigService` import
   - Converted `RateLimiterService` to factory provider

3. **`tests/e2e/project-view-counter.e2e-spec.ts`**
   - Fixed supertest import
   - Removed `name` field from user creation
   - Fixed cleanup order to respect foreign key constraints

## Testing

Run e2e tests:

```bash
npm run test:e2e
```

Expected result: All 7 tests should pass.

## Notes

- The `RateLimiterService` factory pattern allows proper dependency injection while maintaining backward compatibility with the optional constructor parameters used in unit tests.
- The cleanup order is critical when dealing with foreign key constraints. Always delete child records (projects) before parent records (users).
- E2e tests use the real `AppModule`, so all services must be properly configured for dependency injection.
