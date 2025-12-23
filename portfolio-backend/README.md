# Portfolio Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A production-ready REST API built with **NestJS**, following **Clean Architecture** principles. This backend powers the Portfolio application with authentication, project management, commenting system, and advanced caching mechanisms.

## ✨ Features

- 🏗️ **Clean Architecture** - Domain-driven design with clear separation of concerns
- 🔐 **JWT Authentication** - Secure authentication with access & refresh tokens (HttpOnly cookies)
- 👤 **Role-Based Access Control (RBAC)** - OWNER and VIEWER roles
- 📦 **Project Management** - Full CRUD operations with optimistic/pessimistic locking
- 💬 **Comments System** - Nested comments for projects
- 🚀 **Redis Caching** - Automatic cache-aside pattern with intelligent invalidation
- ⚡ **Rate Limiting** - Configurable request throttling per IP
- 🗄️ **PostgreSQL + Prisma ORM** - Type-safe database operations
- 🧪 **Comprehensive Testing** - Unit tests & E2E tests included

## 📁 Project Structure

```
portfolio-backend/
├── src/
│   ├── domain/                 # Domain Layer (Business Entities & Interfaces)
│   │   ├── entities/           # Pure domain entities (User, Project, Comment)
│   │   ├── enums/              # Domain enums (Role)
│   │   └── repositories/       # Repository interfaces (contracts)
│   │
│   ├── application/            # Application Layer (Use Cases & DTOs)
│   │   ├── use-cases/          # Business logic orchestration
│   │   ├── dtos/               # Data Transfer Objects
│   │   └── dto/                # Auth-specific DTOs
│   │
│   ├── infrastructure/         # Infrastructure Layer (External Services)
│   │   ├── database/           # Prisma service
│   │   ├── repositories/       # Repository implementations
│   │   ├── cache/              # Redis cache service & interceptor
│   │   ├── auth/               # JWT strategies, guards, decorators
│   │   └── rate-limiter/       # Rate limiting service
│   │
│   └── interface/              # Interface Layer (Controllers & Mappers)
│       ├── controllers/        # HTTP endpoint handlers
│       ├── mappers/            # Entity <-> DTO conversion
│       └── modules/            # Feature modules (Auth, Admin)
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed data script
│
├── tests/
│   ├── unit/                   # Unit tests
│   └── e2e/                    # End-to-end tests
│
└── docker/                     # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14
- **Redis** >= 6.x
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
cd portfolio-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with proper values (see Environment Variables section)
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (creates default admin user)
npm run prisma:seed
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`.

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_SECURE=false         # Set to true in production with HTTPS
COOKIE_SAME_SITE=lax        # Options: strict | lax | none

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_TTL=60000        # Time window in milliseconds
RATE_LIMIT_MAX=100          # Max requests per time window

# Application
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint        | Description                  | Auth Required    |
| ------ | --------------- | ---------------------------- | ---------------- |
| POST   | `/auth/login`   | Login with email & password  | ❌               |
| POST   | `/auth/refresh` | Refresh access token         | ❌ (uses cookie) |
| POST   | `/auth/logout`  | Logout and invalidate tokens | ✅               |
| GET    | `/auth/me`      | Get current user profile     | ✅               |

### Projects

| Method | Endpoint                         | Description                       | Auth Required |
| ------ | -------------------------------- | --------------------------------- | ------------- |
| GET    | `/projects`                      | Get all projects                  | ❌            |
| GET    | `/projects/:id`                  | Get project by ID                 | ❌            |
| GET    | `/projects/user/:userId`         | Get projects by user              | ❌            |
| POST   | `/projects`                      | Create new project                | ❌            |
| PUT    | `/projects/:id`                  | Update project                    | ❌            |
| DELETE | `/projects/:id`                  | Delete project                    | ❌            |
| POST   | `/projects/:id/view-pessimistic` | Increment view (pessimistic lock) | ❌            |
| POST   | `/projects/:id/view-optimistic`  | Increment view (optimistic lock)  | ❌            |

### Comments

| Method | Endpoint                       | Description             | Auth Required |
| ------ | ------------------------------ | ----------------------- | ------------- |
| POST   | `/comments`                    | Create a comment        | ❌            |
| GET    | `/comments/project/:projectId` | Get comments by project | ❌            |

### Users

| Method | Endpoint | Description     | Auth Required |
| ------ | -------- | --------------- | ------------- |
| POST   | `/users` | Create new user | ❌            |

### Admin (Protected)

| Method | Endpoint              | Description      | Auth Required | Role         |
| ------ | --------------------- | ---------------- | ------------- | ------------ |
| GET    | `/admin/projects`     | Get all projects | ✅            | OWNER/VIEWER |
| POST   | `/admin/projects`     | Create project   | ✅            | OWNER        |
| PATCH  | `/admin/projects/:id` | Update project   | ✅            | OWNER        |
| DELETE | `/admin/projects/:id` | Delete project   | ✅            | OWNER        |

### Health Check

| Method | Endpoint  | Description       | Auth Required |
| ------ | --------- | ----------------- | ------------- |
| GET    | `/health` | API health status | ❌            |

## 🔐 Authentication Flow

1. **Login** - `POST /auth/login` with email & password
   - Returns `accessToken` in response body
   - Sets `accessToken` and `refreshToken` as HttpOnly cookies

2. **Access Protected Routes** - Include cookies or `Authorization: Bearer <token>`

3. **Token Refresh** - `POST /auth/refresh`
   - Uses `refreshToken` from cookies
   - Returns new access token and rotates refresh token

4. **Logout** - `POST /auth/logout`
   - Clears cookies and invalidates refresh token in database

### Default Users (after seeding)

| Email              | Password  | Role   |
| ------------------ | --------- | ------ |
| admin@example.com  | admin123  | OWNER  |
| viewer@example.com | viewer123 | VIEWER |

## 🚀 Caching Strategy

The API implements **cache-aside pattern** with automatic cache invalidation:

- **GET endpoints** - Automatically cached with configurable TTL
- **Write operations** - Trigger cache invalidation for related data

### Cache TTL Configuration

| Endpoint              | Cache TTL |
| --------------------- | --------- |
| GET /projects         | 60s       |
| GET /projects/:id     | 120s      |
| GET /projects/user/\* | 60s       |

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run unit tests with watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

## 🐳 Docker Support

```bash
# Build and run with Docker Compose (from root portfolio directory)
docker compose up --build

# Run only the backend service
docker compose up backend
```

## 📜 Scripts Reference

| Command                   | Description                     |
| ------------------------- | ------------------------------- |
| `npm run start`           | Start in development mode       |
| `npm run start:dev`       | Start with hot reload           |
| `npm run start:prod`      | Start in production mode        |
| `npm run build`           | Build for production            |
| `npm run lint`            | Run ESLint                      |
| `npm run format`          | Format code with Prettier       |
| `npm run test`            | Run unit tests                  |
| `npm run test:e2e`        | Run E2E tests                   |
| `npm run test:cov`        | Generate coverage report        |
| `npm run prisma:generate` | Generate Prisma client          |
| `npm run prisma:migrate`  | Run database migrations         |
| `npm run prisma:studio`   | Open Prisma Studio (DB GUI)     |
| `npm run prisma:seed`     | Seed database with initial data |

## 🏗️ Architecture Overview

This project follows **Clean Architecture** with 4 distinct layers:

```
┌─────────────────────────────────────────────┐
│               Interface Layer               │
│    (Controllers, Mappers, HTTP handling)    │
├─────────────────────────────────────────────┤
│             Application Layer               │
│      (Use Cases, DTOs, Business Rules)      │
├─────────────────────────────────────────────┤
│            Infrastructure Layer             │
│   (Database, Cache, Auth, External APIs)    │
├─────────────────────────────────────────────┤
│               Domain Layer                  │
│     (Entities, Repository Interfaces)       │
└─────────────────────────────────────────────┘
```

**Dependency Rule**: Dependencies point INWARD only. The Domain layer has NO knowledge of outer layers.

## 📝 Database Schema

### Models

- **User** - Authentication & authorization
- **Project** - Portfolio projects with view tracking
- **ProjectStats** - Extended project statistics (views, likes)
- **Comment** - Project comments
- **AuditLog** - Activity logging

### Roles

- **OWNER** - Full access to all resources
- **VIEWER** - Read-only access

## 🤝 Contributing

1. Follow the Clean Architecture patterns
2. Write tests for new features
3. Run `npm run lint` before committing
4. Use meaningful commit messages

## 📄 License

This project is [MIT licensed](LICENSE).
