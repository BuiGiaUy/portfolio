# Portfolio - Production-Ready Fullstack System

A modern, production-grade portfolio application showcasing Clean Architecture, React Query, JWT authentication, real-time caching, and comprehensive testing.

## 🏗️ Architecture

```
portfolio/
├── portfolio-backend/     # NestJS API (Clean Architecture)
├── portfolio-frontend/    # Next.js 14 App Router
├── ARCHITECTURE.md        # System design documentation
├── DEPLOYMENT.md          # Deployment guide
└── E2E_AND_OBSERVABILITY.md  # Testing & monitoring guide
```

## ✨ Key Features

- 🏛️ **Clean Architecture** - Domain-driven design with clear separation
- 🔐 **Secure Authentication** - JWT with HttpOnly cookies
- ⚡ **Redis Caching** - Automatic cache-aside pattern
- 🧪 **Comprehensive Testing** - Unit, E2E (Playwright), and integration tests
- 📊 **Observability** - Sentry error tracking + structured logging
- 🚀 **CI/CD Ready** - GitHub Actions pipeline with Docker deployment
- 🌐 **i18n Support** - English/Vietnamese multilingual support

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- Redis ≥ 6
- Docker (optional)

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/portfolio.git
cd portfolio

# Backend setup
cd portfolio-backend
npm install
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Frontend setup (new terminal)
cd portfolio-frontend
npm install
cp .env.example .env.local
npm run dev
```

**Access:**

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api

### Docker Deployment

```bash
# Build and run all services
docker compose up --build

# Run detached
docker compose up -d
```

## 📚 Documentation

| Document                                                       | Description                            |
| -------------------------------------------------------------- | -------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                           | System design, patterns, and structure |
| [DEPLOYMENT.md](./DEPLOYMENT.md)                               | Production deployment guide            |
| [E2E_AND_OBSERVABILITY.md](./E2E_AND_OBSERVABILITY.md)         | Testing and monitoring setup           |
| [portfolio-backend/README.md](./portfolio-backend/README.md)   | Backend API documentation              |
| [portfolio-frontend/README.md](./portfolio-frontend/README.md) | Frontend app documentation             |

## 🧪 Testing

```bash
# Backend tests
cd portfolio-backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report

# Frontend tests
cd portfolio-frontend
npm run test:e2e          # Playwright E2E tests
npm run test:e2e:ui       # Visual debugger
```

## 🛠️ Tech Stack

### Backend

- NestJS 10
- Prisma ORM
- PostgreSQL
- Redis
- JWT Authentication
- Sentry

### Frontend

- Next.js 14 (App Router)
- React Query (TanStack Query)
- TypeScript
- Tailwind CSS

### Infrastructure

- Docker & Docker Compose
- GitHub Actions
- Nginx (reverse proxy)

## 📊 Project Status

- ✅ Authentication & Authorization
- ✅ Project CRUD operations
- ✅ Redis caching layer
- ✅ E2E testing suite
- ✅ Structured logging
- ✅ Error tracking (Sentry)
- ✅ CI/CD pipeline
- ✅ Docker deployment

## 🤝 Contributing

1. Follow Clean Architecture patterns
2. Write tests for new features
3. Run linters before committing
4. Update documentation as needed

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using NestJS and Next.js**
