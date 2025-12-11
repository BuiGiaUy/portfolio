# Jest Test Configuration

This project uses Jest for unit testing with the following configuration:

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run tests in debug mode
npm run test:debug
```

## Test Structure

Tests follow the Clean Architecture layers:

### Domain Layer Tests

- `src/domain/entities/user.entity.spec.ts` - Tests for User entity business logic
- Pure unit tests with no dependencies

### Application Layer Tests

- `src/application/usecases/create-user.usecase.spec.ts` - Tests for use cases
- Uses mocked repositories (dependency injection)

### Infrastructure Layer Tests

- `src/infrastructure/repositories/user-inmemory.repository.spec.ts` - Repository implementation tests
- Tests data persistence logic

### Interface Layer Tests

- `src/interface/controllers/health.controller.spec.ts` - Controller tests
- `src/interface/mappers/user.mapper.spec.ts` - Mapper tests

## Test Naming Convention

- Test files: `*.spec.ts`
- Located alongside the source files they test
- Describe blocks follow the class/method structure

## Mocking Strategy

- **Domain Layer**: No mocks needed (pure business logic)
- **Application Layer**: Mock repository interfaces
- **Infrastructure Layer**: Test actual implementations
- **Interface Layer**: Mock services/use cases as needed

## Coverage Goals

Run `npm run test:cov` to see coverage report in the `coverage/` directory.

Target coverage:

- Statements: > 80%
- Branches: > 80%
- Functions: > 80%
- Lines: > 80%
