# Quick E2E Testing Setup

## ❗ IMPORTANT: Tests are failing because backend is not running!

The E2E tests require **both backend and frontend to be running**.

## Setup Steps

### 1. Start PostgreSQL (if using Docker)

```bash
cd d:\Project\portfolio
docker-compose up -d postgres
```

### 2. Run Database Migrations & Seed

```bash
cd portfolio-backend
npm run prisma:migrate
npm run prisma:seed
```

Expected output:

```
🌱 Starting database seed...
✅ Created OWNER user
✅ Created VIEWER user
✅ Created E2E Admin user: admin@example.com
✅ Created E2E User: user@example.com
🎉 Database seed completed successfully!
```

### 3. Start Backend

```bash
# From portfolio-backend directory
npm run start:dev
```

**Wait for**: `🚀 Application started on port 3000`

### 4. Start Frontend (New Terminal)

```bash
cd portfolio-frontend
npm run dev
```

**Wait for**: `Ready in X.Xs`

### 5. Run E2E Tests (New Terminal)

```bash
cd portfolio-frontend
npm run test:e2e
```

---

## Troubleshooting

### "ECONNREFUSED" in tests

**Problem**: Backend not running  
**Fix**: Start backend (`npm run start:dev` in portfolio-backend)

### "Login failed: 401"

**Problem**: Test users not seeded  
**Fix**: Run `npm run prisma:seed` in portfolio-backend

### Tests timeout

**Problem**: Frontend not responding  
**Fix**: Start frontend (`npm run dev` in portfolio-frontend)

---

## Quick Commands (Copy-Paste)

**Terminal 1 - Backend**:

```bash
cd d:\Project\portfolio\portfolio-backend
npm run start:dev
```

**Terminal 2 - Frontend**:

```bash
cd d:\Project\portfolio\portfolio-frontend
npm run dev
```

**Terminal 3 - E2E Tests**:

```bash
cd d:\Project\portfolio\portfolio-frontend
npm run test:e2e
```

---

## What the Tests Do

- ✅ **Auth Flow**: Login, logout, session persistence
- ✅ **Protected Routes**: Middleware auth guards
- ✅ **Projects CRUD**: Create, read, update, delete
- ✅ **Error Handling**: Invalid credentials, network errors

All tests use **real backend API** (no mocks) with **test users**:

- `admin@example.com` / `Admin123!@#`
- `user@example.com` / `User123!@#`

---

## Fixes Applied

✅ Fixed syntax errors (missing dots in `expect().not.toContain()`)  
✅ Removed `/api` prefix from endpoints  
✅ Updated test users in seed script  
✅ All dependencies installed successfully

**Status**: Tests are ready to run once backend is started! 🚀
