# Project Structure

This project follows **Clean Architecture** principles to ensure separation of concerns, maintainability, and testability.

## Directory Tree

```text
src/
├── application/       # Application business rules (Use Cases)
├── domain/            # Enterprise business rules (Entities, Repository Interfaces)
├── infrastructure/    # Frameworks & Drivers (Database, External Services)
├── interface/         # Interface Adapters (Controllers, Presenters)
├── config/            # Configuration files
├── app.module.ts      # Root Module
└── main.ts            # Entry point
```

## Layer Descriptions

### 1. Domain Layer (`src/domain`)

The core of the application. It contains the business logic and rules that are independent of any external agency.

- **Entities**: Core business objects (e.g., `User`).
- **Repository Interfaces**: Abstract definitions of how to access data (e.g., `IUserRepository`).

### 2. Application Layer (`src/application`)

Orchestrates the flow of data to and from the entities, and directs those entities to use their enterprise wide business rules to achieve the goals of the use case.

- **Use Cases**: Specific application actions (e.g., `CreateUserUseCase`).
- **DTOs**: Data Transfer Objects for input/output.

### 3. Interface Layer (`src/interface`)

Adapts data from the format most convenient for the use cases and entities, to the format most convenient for some external agency such as the Database or the Web.

- **Controllers**: Handle incoming HTTP requests.

### 4. Infrastructure Layer (`src/infrastructure`)

The outermost layer, generally composed of frameworks and tools such as the Database, the Web Framework, etc.

- **Repositories**: Implementations of the domain repository interfaces (e.g., `UserInMemoryRepository`).
