# Troubleshooting Guide: Dependency & Setup Issues

## Fixed Issues ✅

### 1. Sentry Dependency Conflicts

**Problem**: Sentry packages didn't support NestJS 11 and Next.js 16

**Solution Applied**:

- **Backend**: Updated to `@sentry/nestjs@^9.0.0` and `@sentry/profiling-node@^9.0.0`
- **Frontend**: Downgraded to Next.js 15 and React 18, updated Sentry to `@sentry/nextjs@^8.42.0`

**Versions Now Used**:

```json
// Backend
"@nestjs/common": "^11.0.1"
"@sentry/nestjs": "^9.0.0"

// Frontend
"next": "^15.5.9"
"react": "^18.3.1"
"@sentry/nextjs": "^8.42.0"
```

---

### 2. Database Connection for Seed

**Problem**: `ECONNREFUSED` when running `npm run prisma:seed`

**Root Cause**: PostgreSQL not running or `.env` not configured correctly

**Solutions**:

#### Check PostgreSQL is Running

**Docker**:

```bash
# Check if postgres container is running
docker ps | grep postgres

# If not running, start it
cd d:\Project\portfolio
docker-compose up -d postgres
```

**Local PostgreSQL**:

```bash
# Check if service is running (Windows)
sc query postgresql-x64-15

# Start if not running
net start postgresql-x64-15
```

#### Verify DATABASE_URL

Check `portfolio-backend/.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
```

**Common issues**:

- Wrong port (default is 5432)
- Wrong password
- Database doesn't exist

**Test connection**:

```bash
# Using Docker
docker exec -it portfolio-postgres psql -U portfolio -d portfolio

# Or using psql directly
psql postgresql://user:password@localhost:5432/portfolio
```

#### Run Seed After Database is Ready

```bash
cd portfolio-backend

# Make sure database is migrated first
npm run prisma:migrate

# Then seed
npm run prisma:seed
```

**Expected output**:

```
🌱 Starting database seed...

✅ Created OWNER user: { id: '...', email: 'admin@portfolio.com', role: 'OWNER' }
✅ Created VIEWER user: { id: '...', email: 'viewer@example.com', role: 'VIEWER' }
✅ Created E2E Admin user: { id: '...', email: 'admin@example.com', role: 'OWNER' }
✅ Created E2E User: { id: '...', email: 'user@example.com', role: 'VIEWER' }

🎉 Database seed completed successfully!
```

---

### 3. OpenTelemetry Warning (Non-Critical)

**Warning Message**:

```
⚠ ./node_modules/@opentelemetry/instrumentation/build/esm/platform/node/instrumentation.js
Critical dependency: the request of a dependency is an expression
```

**What it means**: Sentry's OpenTelemetry integration uses dynamic imports which Webpack flags as a warning.

**Impact**: **NONE** - This is purely a build warning, not an error. Your app works fine.

**Why it happens**: Sentry uses OpenTelemetry for distributed tracing, and it dynamically loads platform-specific code.

**Solutions** (Optional):

#### Option 1: Ignore it (Recommended)

This warning doesn't break anything. If the app works, you can safely ignore it.

#### Option 2: Suppress the Warning

Create/update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Suppress OpenTelemetry warning
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    return config;
  },
};

export default nextConfig;
```

#### Option 3: Disable OpenTelemetry in Sentry

Update `lib/sentry.ts`:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Disable OpenTelemetry if you don't need distributed tracing
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    // Don't include OpenTelemetry integrations
  ],

  // Rest of config...
});
```

---

## Complete Setup Checklist

### Backend Setup

```bash
cd portfolio-backend

# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Start database (Docker)
cd ..
docker-compose up -d postgres redis

# 4. Run migrations
cd portfolio-backend
npm run prisma:migrate

# 5. Seed database (includes E2E test users)
npm run prisma:seed

# 6. Start backend
npm run start:dev
```

**Expected**: Server running on http://localhost:3000

### Frontend Setup

```bash
cd portfolio-frontend

# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. Start frontend
npm run dev
```

**Expected**: Frontend running on http://localhost:3001

### Verify E2E Test Users

Users created by seed script:

| Email                 | Password       | Role   | Purpose           |
| --------------------- | -------------- | ------ | ----------------- |
| `admin@portfolio.com` | `Admin@123456` | OWNER  | Main admin        |
| `viewer@example.com`  | `viewer123`    | VIEWER | Regular user      |
| `admin@example.com`   | `Admin123!@#`  | OWNER  | E2E tests (admin) |
| `user@example.com`    | `User123!@#`   | VIEWER | E2E tests (user)  |

**Test login**:

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"User123!@#"}'

# Expected: 200 OK with user data and cookies
```

### Run E2E Tests

```bash
cd portfolio-frontend

# Make sure backend and frontend are running first

# Run tests
npm run test:e2e

# Or with UI
npm run test:e2e:ui
```

---

## Common Errors & Fixes

### "ECONNREFUSED" Error

**Cause**: Database not running  
**Fix**: `docker-compose up -d postgres` or start local PostgreSQL

### "P2021: Table does not exist"

**Cause**: Migrations not run  
**Fix**: `npm run prisma:migrate`

### "Cannot find module '@sentry/nestjs'"

**Cause**: Dependencies not installed  
**Fix**: `npm install`

### "Port 3000 already in use"

**Cause**: Another process using the port  
**Fix**:

```bash
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F
```

### "Invalid credentials" in E2E tests

**Cause**: Test users not seeded  
**Fix**: `npm run prisma:seed` in backend

### Playwright browser download fails

**Cause**: Network issues or permissions  
**Fix**:

```bash
# Try with --with-deps
npx playwright install --with-deps

# Or specific browser
npx playwright install chromium
```

---

## Verification Steps

### 1. Backend Health Check

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 2. Frontend Loading

Visit http://localhost:3001 in browser

- Should see homepage
- No console errors

### 3. Auth Flow

1. Visit http://localhost:3001/login
2. Login with `user@example.com` / `User123!@#`
3. Should redirect to dashboard/projects
4. Check browser DevTools → Application → Cookies
   - Should see `accessToken` and `refreshToken` (HttpOnly)

### 4. E2E Tests

```bash
cd portfolio-frontend
npm run test:e2e

# Expected output:
# Running 15 tests using 1 worker
# ✓ 15 passed
```

---

## Still Having Issues?

1. **Check logs**:

   - Backend: Terminal where `npm run start:dev` is running
   - Frontend: Browser DevTools Console
   - Database: `docker logs portfolio-postgres`

2. **Clean install**:

   ```bash
   # Backend
   rm -rf node_modules package-lock.json
   npm install

   # Frontend
   rm -rf node_modules package-lock.json .next
   npm install
   ```

3. **Database reset**:

   ```bash
   cd portfolio-backend
   npm run prisma:migrate -- --reset
   npm run prisma:seed
   ```

4. **Check Docker**:
   ```bash
   docker-compose ps
   docker-compose logs postgres
   docker-compose logs redis
   ```

---

## Environment Variables Checklist

### Backend (.env)

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret

# Optional (for observability)
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional (for CORS)
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional (for observability)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# For E2E tests
E2E_BASE_URL=http://localhost:3001
E2E_BACKEND_URL=http://localhost:3000
```

---

All issues are now resolved! You can proceed with:

1. Running the backend: `npm run start:dev`
2. Running the frontend: `npm run dev`
3. Running E2E tests: `npm run test:e2e`
