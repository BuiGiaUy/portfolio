# E2E Testing & Observability - Quick Reference

## Installation

### Backend

```bash
cd portfolio-backend
npm install
# Sentry packages: @sentry/nestjs, @sentry/profiling-node
```

### Frontend

```bash
cd portfolio-frontend
npm install
# Playwright: @playwright/test
# Sentry: @sentry/nextjs

# Install browsers for Playwright
npx playwright install
```

---

## E2E Testing Commands

```bash
# Run all tests (headless)
npm run test:e2e

# Visual debugger
npm run test:e2e:ui

# Watch browser execution
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View last report
npm run test:e2e:report
```

---

## Test Structure

### Auth Flow (`e2e/tests/auth.spec.ts`)

- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Logout and clear cookies
- ✅ Session persistence across reloads
- ✅ Redirect with ?redirect parameter

### Protected Routes (`e2e/tests/protected-routes.spec.ts`)

- ✅ Block unauthenticated access
- ✅ Allow authenticated access
- ✅ Redirect to login when not authenticated
- ✅ Security headers on all responses

### Business Logic (`e2e/tests/projects.spec.ts`)

- ✅ View projects (public)
- ✅ Create project (authenticated)
- ✅ Edit project (authenticated)
- ✅ Delete project (authenticated)
- ✅ Increment view count
- ✅ Error handling

---

## Logging Usage

### Backend (src/infrastructure/logging/)

```typescript
import { StructuredLogger } from 'src/infrastructure/logging/structured-logger.service';

constructor(private readonly logger: StructuredLogger) {}

// Info log
this.logger.log('User logged in', { userId: '123' });

// Error log
this.logger.error('Database failed', error.stack, {
  userId: '123',
  operation: 'createProject'
});

// Warning
this.logger.warn('Cache miss', { key: 'projects:all' });
```

### Log Output

**Development**: Human-readable console  
**Production**: JSON structured logs

```json
{
  "timestamp": "2025-12-26T02:00:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "userId": "abc123",
  "statusCode": 500
}
```

---

## Sentry Integration

### Backend Setup

1. **Initialize in main.ts** (MUST be first):

```typescript
import { initSentry } from "./infrastructure/observability/sentry.config";
initSentry();
```

2. **Set user context after login**:

```typescript
import {
  setSentryUser,
  clearSentryUser,
} from "src/infrastructure/observability/sentry.config";

// After login
setSentryUser(userId);

// After logout
clearSentryUser();
```

3. **Manual error capture**:

```typescript
import { captureException } from "src/infrastructure/observability/sentry.config";

try {
  // risky operation
} catch (error) {
  captureException(error, { context: "additional info" });
  throw error;
}
```

### Frontend Setup

1. **Wrap app with SentryProvider** (app/layout.tsx):

```tsx
import { SentryProvider } from "@/components/SentryProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SentryProvider>{children}</SentryProvider>
      </body>
    </html>
  );
}
```

2. **Set user context after login**:

```typescript
import { setSentryUser, clearSentryUser } from "@/lib/sentry";

// After login
setSentryUser(user.id);

// After logout
clearSentryUser();
```

---

## Environment Variables

### Backend (.env)

```bash
# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NODE_ENV=production
```

### Frontend (.env.local)

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_ENV=production

# E2E Testing
E2E_BASE_URL=http://localhost:3001
E2E_BACKEND_URL=http://localhost:3000
```

---

## What Gets Tracked

### Sentry - Backend

✅ 500 Internal Server Errors  
✅ Unhandled exceptions  
✅ Database failures  
❌ 400 Bad Request  
❌ 404 Not Found

### Sentry - Frontend

✅ Unhandled React errors  
✅ Network failures  
✅ Runtime errors  
❌ 404 pages  
❌ Console logs

### Structured Logs

✅ Auth events (login, logout)  
✅ Critical API failures  
✅ Cache misses (if relevant)  
❌ Passwords, tokens  
❌ Full emails (masked)  
❌ Cookie values

---

## File Locations

### E2E Tests

```
portfolio-frontend/
├── e2e/
│   ├── tests/              # Test files
│   ├── fixtures/           # Test data & helpers
│   └── utils/              # Utilities
├── playwright.config.ts    # Playwright config
└── .env.e2e.example        # E2E env template
```

### Backend Observability

```
portfolio-backend/
└── src/
    └── infrastructure/
        ├── logging/
        │   ├── structured-logger.service.ts
        │   └── logging.module.ts
        └── observability/
            ├── sentry.config.ts
            └── global-exception.filter.ts
```

### Frontend Observability

```
portfolio-frontend/
├── lib/
│   └── sentry.ts                    # Sentry config
├── components/
│   └── SentryProvider.tsx           # Sentry provider
└── app/
    └── global-error.tsx             # Error boundary
```

---

## Quick Test

### Test E2E Suite

```bash
cd portfolio-frontend
npm run test:e2e
```

### Test Structured Logging

```bash
cd portfolio-backend
npm run start:dev
# Check console for JSON logs in production mode
```

### Test Sentry

1. Add `SENTRY_DSN` to `.env` (backend) and `.env.local` (frontend)
2. Start apps
3. Trigger an error
4. Check Sentry dashboard

---

## Troubleshooting

| Problem               | Solution                                   |
| --------------------- | ------------------------------------------ |
| E2E tests timeout     | Ensure backend & frontend are running      |
| "Sentry disabled"     | Set `SENTRY_DSN` in environment            |
| No logs in production | Verify `NODE_ENV=production`               |
| Tests fail on CI      | Set `CI=true`, install Playwright browsers |
| Auth tests fail       | Ensure test users exist in database        |

---

## Production Checklist

Before deploying:

- [ ] Add `SENTRY_DSN` to production environment
- [ ] Verify logs are JSON format (`NODE_ENV=production`)
- [ ] Test Sentry by triggering test error
- [ ] Configure Sentry alerts for critical errors
- [ ] Seed test users for E2E tests
- [ ] Run E2E suite: `CI=true npm run test:e2e`
- [ ] Verify no PII in logs/Sentry (check dashboard)

---

## CI/CD Integration

**GitHub Actions Example**:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
    E2E_BASE_URL: ${{ secrets.E2E_BASE_URL }}
    E2E_BACKEND_URL: ${{ secrets.E2E_BACKEND_URL }}
```

---

## Key Design Decisions

### Why Playwright?

- First-class TypeScript support
- Real browser testing (not jsdom)
- HttpOnly cookie support (critical for auth)
- Built-in retry, screenshot, video
- Parallel execution

### Why Structured Logging?

- Production-ready (JSON parsing)
- Safe (auto-sanitizes PII)
- Minimal overhead
- Easy to extend

### Why Sentry?

- Industry standard
- Built-in performance monitoring
- Session replay for debugging
- Free tier generous for portfolio projects

### Why in Infrastructure Layer?

- Keeps domain and application layers clean
- Observability is an infrastructure concern
- Easy to swap implementations
- Follows Clean Architecture principles

---

For detailed explanations, see [E2E_AND_OBSERVABILITY.md](./E2E_AND_OBSERVABILITY.md)
