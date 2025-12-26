# E2E Testing & Observability - Implementation Guide

## Overview

This document provides implementation details for the E2E testing (Playwright) and observability (Sentry + structured logging) added to the portfolio system.

---

## PART 1: END-TO-END TESTING

### Architecture

**Location**: `portfolio-frontend/e2e/`

**Structure**:

```
e2e/
├── tests/
│   ├── auth.spec.ts              # Auth flow tests
│   ├── protected-routes.spec.ts  # Route protection tests
│   └── projects.spec.ts          # Business logic tests
├── fixtures/
│   ├── test-users.ts             # Test data
│   └── auth.ts                   # Auth helpers
└── utils/
    └── helpers.ts                # Reusable utilities
```

### Why These Tests Exist

#### 1. **auth.spec.ts** - Authentication Flow

- **What**: Tests login, logout, session persistence, cookie handling
- **Why**: Auth is the security foundation. Must work perfectly.
- **Coverage**:
  - Valid login → HttpOnly cookies set → redirect works
  - Invalid credentials → stays on login page → no cookies
  - Logout → clears cookies → blocks protected access
  - Session persistence across page reloads

#### 2. **protected-routes.spec.ts** - Authorization

- **What**: Tests middleware-based route protection
- **Why**: Ensures unauthorized users can't access sensitive pages
- **Coverage**:
  - Unauthenticated → redirect to /login?redirect=/dashboard
  - Authenticated → can access protected routes
  - Session expiry → redirect to login
  - Security headers applied correctly

#### 3. **projects.spec.ts** - Business Logic

- **What**: Tests CRUD operations end-to-end
- **Why**: Verifies main app functionality works from UI → API → Database
- **Coverage**:
  - Create project → appears in list
  - Edit project → changes persist
  - Delete project → removed from UI and database
  - View count increment → optimistic update works
  - Error handling → shows user-friendly messages

### Test Data Strategy

**Option 1: Database Seeding (Recommended)**

```bash
# Backend - create test seed
cd portfolio-backend
npm run prisma:seed
```

Test users defined in `e2e/fixtures/test-users.ts`:

- `admin@example.com` / `Admin123!@#` (admin role)
- `user@example.com` / `User123!@#` (user role)

**Option 2: API Setup in beforeEach**

```typescript
test.beforeEach(async ({ context }) => {
  // Create test user via API
  await context.request.post('/api/users', { ... });
});
```

### Running Tests

```bash
cd portfolio-frontend

# Install Playwright browsers
npx playwright install

# Run all tests (headless)
npm run test:e2e

# Run with UI (visual debugger)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (pause on failures)
npm run test:e2e:debug

# View last report
npm run test:e2e:report
```

### CI/CD Integration

The tests are CI-ready:

- Set `CI=true` environment variable
- Runs in single worker (no parallelism)
- Retries failures 2x
- Outputs JUnit XML for test reporting

**GitHub Actions Example**:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
    E2E_BASE_URL: http://localhost:3001
    E2E_BACKEND_URL: http://localhost:3000
```

### Debugging Failed Tests

1. **Check screenshots**: `test-results/screenshots/`
2. **Watch videos**: `test-results/videos/`
3. **Read traces**: `playwright show-trace trace.zip`
4. **Use debug mode**: `npm run test:e2e:debug`

### Best Practices

✅ **DO**:

- Use semantic selectors (`getByRole`, `getByLabel`, `getByText`)
- Test user behavior, not implementation
- Clean up test data in `afterEach`
- Use `data-testid` for complex selectors
- Keep tests independent (no shared state)

❌ **DON'T**:

- Mock auth or cookies (test the real thing)
- Use brittle CSS selectors
- Test styling or pixel-perfect layouts
- Leave orphaned test data in database
- Run tests against production

---

## PART 2: OBSERVABILITY

### Architecture

**Backend**: `src/infrastructure/`

```
infrastructure/
├── logging/
│   ├── structured-logger.service.ts  # JSON logger
│   └── logging.module.ts             # Global module
└── observability/
    ├── sentry.config.ts              # Sentry init
    └── global-exception.filter.ts    # Error handler
```

**Frontend**: `lib/sentry.ts`, `components/SentryProvider.tsx`

### Why This Approach

1. **Structured Logging** (Backend Only)

   - **Production**: JSON output → easy to parse by log aggregators
   - **Development**: Human-readable console logs
   - **Security**: Auto-sanitizes PII (tokens, passwords, emails)
   - **Context**: Attaches userId, requestId, statusCode, etc.

2. **Sentry** (Backend + Frontend)
   - **Error Tracking**: Captures unhandled exceptions
   - **Performance**: Monitors slow requests
   - **User Context**: Attaches userId (no PII)
   - **Filtering**: Skips 404s, validation errors

### Logging Usage

**In Controllers or Use Cases**:

```typescript
import { StructuredLogger } from "src/infrastructure/logging/structured-logger.service";

@Injectable()
export class SomeUseCase {
  constructor(private readonly logger: StructuredLogger) {}

  async execute() {
    this.logger.log("Operation started", { userId: "123" });

    try {
      // Business logic
      this.logger.log("Operation successful");
    } catch (error) {
      this.logger.error("Operation failed", error.stack, { userId: "123" });
      throw error;
    }
  }
}
```

**Log Levels**:

- `log()` - Info (successful operations)
- `warn()` - Warnings (degraded performance, fallbacks)
- `error()` - Errors (failures requiring attention)
- `debug()` / `verbose()` - Only in development

**What Gets Logged**:
✅ Auth events (login, logout, refresh)  
✅ Critical API failures (500 errors)  
✅ Database connection issues  
✅ Cache failures (when degrading to DB)

❌ Passwords or tokens  
❌ Full email addresses (masked)  
❌ Cookie values  
❌ Request bodies with PII

### Sentry Configuration

**Backend** (`main.ts`):

```typescript
import { initSentry } from "./infrastructure/observability/sentry.config";
initSentry(); // MUST be first import
```

**Frontend** (root layout):

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

**User Context** (set after login):

```typescript
import { setSentryUser, clearSentryUser } from "@/lib/sentry";

// After successful login
setSentryUser(userId);

// After logout
clearSentryUser();
```

### Environment Variables

**Backend** (`.env`):

```bash
# Sentry
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NODE_ENV=production

# Logging (optional)
LOG_LEVEL=info  # info, warn, error
```

**Frontend** (`.env.local`):

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_ENV=production
```

### What Gets Sent to Sentry

**Backend**:
✅ 500 Internal Server Errors  
✅ Unhandled exceptions  
✅ Database failures  
❌ 400 Bad Request (validation errors)  
❌ 404 Not Found

**Frontend**:
✅ Unhandled React errors  
✅ Network failures (API down)  
✅ Runtime JavaScript errors  
❌ 404 page not found  
❌ Console logs

### Production Checklist

Before deploying:

1. **Add Sentry DSN** to environment variables
2. **Test error tracking**: Throw test error, verify it appears in Sentry
3. **Verify PII sanitization**: Check logs don't contain tokens/passwords
4. **Set up alerts**: Configure Sentry to notify on high error rates
5. **Test structured logs**: Verify JSON format in production environment

### Monitoring Dashboard

**Sentry** (errors, performance):

- Go to your Sentry project dashboard
- Check "Issues" for errors
- Check "Performance" for slow requests
- Set up alerts for critical errors

**Logs** (if using aggregator like Datadog, CloudWatch):

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

## Testing the Implementation

### 1. Test E2E Suite

```bash
cd portfolio-frontend
npm install
npx playwright install
npm run test:e2e
```

Expected: All tests pass ✅

### 2. Test Structured Logging

```bash
cd portfolio-backend
npm install

# Start app
npm run start:dev

# Make API call
curl http://localhost:3000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Check console - should see structured log:
# {"timestamp":"...","level":"warn","message":"Invalid credentials",...}
```

### 3. Test Sentry Integration

**Backend**:

1. Add `SENTRY_DSN` to `.env`
2. Start app: `npm run start:dev`
3. Trigger error: Visit `/api/test-error` (create test endpoint)
4. Check Sentry dashboard - should see error appear

**Frontend**:

1. Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
2. Start app: `npm run dev`
3. Trigger error: Click button that throws error
4. Check Sentry dashboard - should see error appear

---

## Troubleshooting

### E2E Tests Fail

**Problem**: Tests timeout or fail unexpectedly  
**Solution**:

- Check both backend and frontend are running
- Verify test users exist in database
- Use `npm run test:e2e:headed` to watch execution
- Check `test-results/` for screenshots/videos

### "Sentry disabled" in logs

**Problem**: Sentry not initializing  
**Solution**:

- Verify `SENTRY_DSN` is set in environment
- Check DSN format: `https://xxx@xxx.ingest.sentry.io/xxx`
- Ensure `NODE_ENV=production` or staging (not development)

### Logs missing in production

**Problem**: No logs appearing  
**Solution**:

- Check `NODE_ENV=production` is set
- Verify logs are JSON format: `{"timestamp":...}`
- Configure log aggregator to parse JSON
- Check stdout/stderr are being captured

---

## Next Steps

1. **Extend E2E coverage**: Add tests for edge cases
2. **Add performance tests**: Use Playwright to measure page load times
3. **Set up log aggregation**: Connect to Datadog, CloudWatch, or similar
4. **Configure Sentry alerts**: Email/Slack on critical errors
5. **Add custom metrics**: Track business KPIs (signups, projects created)

---

## Questions?

- **E2E tests**: See Playwright docs https://playwright.dev
- **Sentry**: See docs https://docs.sentry.io
- **Structured logging**: See NestJS logging docs
