# E2E Testing & Observability

## Overview

This document covers the E2E testing suite (Playwright) and observability implementation (Sentry + structured logging).

## Part 1: End-to-End Testing

### Test Suite Structure

```
portfolio-frontend/e2e/
├── tests/
│   ├── auth.spec.ts              # Authentication flow
│   ├── protected-routes.spec.ts  # Route protection
│   └── projects.spec.ts          # Business logic
├── fixtures/
│   ├── test-users.ts             # Test data
│   └── auth.ts                   # Auth helpers
└── utils/
    └── helpers.ts                # Utilities
```

### Test Coverage

#### 1. Authentication (auth.spec.ts)

- ✅ Valid login → HttpOnly cookies → redirect
- ✅ Invalid credentials → error message
- ✅ Logout → clears cookies
- ✅ Session persistence across reloads

#### 2. Protected Routes (protected-routes.spec.ts)

- ✅ Unauthenticated → redirect to `/login?redirect=/dashboard`
- ✅ Authenticated → access granted
- ✅ Session expiry → redirect to login

#### 3. Business Logic (projects.spec.ts)

- ✅ Create project → appears in list
- ✅ Edit project → changes persist
- ✅ Delete project → removed from UI
- ✅ View count increment → optimistic update

### Test Data

Default test users (from seed):

```typescript
{
  email: 'admin@example.com',
  password: 'Admin123!@#',
  role: 'OWNER'
}
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

Tests are CI-ready with:

- Single worker (no parallelism)
- 2x retry on failure
- JUnit XML output
- Screenshots on failure
- Video recording

**GitHub Actions:**

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    CI: true
```

### Debugging

1. **Screenshots**: `test-results/screenshots/`
2. **Videos**: `test-results/videos/`
3. **Traces**: `playwright show-trace trace.zip`
4. **Debug mode**: `npm run test:e2e:debug`

### Best Practices

✅ **DO:**

- Use semantic selectors (`getByRole`, `getByLabel`)
- Test user behavior, not implementation
- Clean up test data in `afterEach`
- Keep tests independent

❌ **DON'T:**

- Mock auth or cookies
- Use brittle CSS selectors
- Test styling details
- Run tests against production

## Part 2: Observability

### Architecture

**Backend:**

```
infrastructure/
├── logging/
│   ├── structured-logger.service.ts  # JSON logger
│   └── logging.module.ts
└── observability/
    ├── sentry.config.ts
    └── global-exception.filter.ts
```

**Frontend:**

```
lib/sentry.ts
components/SentryProvider.tsx
```

### Structured Logging (Backend)

**Production**: JSON output for log aggregators

```json
{
  "timestamp": "2025-12-26T10:30:00.000Z",
  "level": "info",
  "message": "Project created",
  "userId": "usr_123",
  "projectId": "prj_456"
}
```

**Development**: Human-readable console logs

**Usage:**

```typescript
import { StructuredLogger } from "@/infrastructure/logging";

@Injectable()
export class SomeUseCase {
  constructor(private logger: StructuredLogger) {}

  async execute() {
    this.logger.log("Operation started", { userId: "123" });

    try {
      // Business logic
      this.logger.log("Operation successful");
    } catch (error) {
      this.logger.error("Operation failed", error.stack);
      throw error;
    }
  }
}
```

**Log Levels:**

- `log()` - Info (successful operations)
- `warn()` - Warnings (degraded performance)
- `error()` - Errors (failures)
- `debug()` / `verbose()` - Development only

**Security:**

- ✅ Auto-sanitizes passwords, tokens, cookies
- ✅ Masks email addresses
- ✅ Removes PII from logs
- ❌ Never logs sensitive data

### Sentry Error Tracking

**Backend Configuration:**

```typescript
// main.ts
import { initSentry } from "./infrastructure/observability/sentry.config";
initSentry(); // MUST be first
```

**Frontend Configuration:**

```tsx
// app/layout.tsx
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

**User Context:**

```typescript
import { setSentryUser, clearSentryUser } from "@/lib/sentry";

// After login
setSentryUser(userId);

// After logout
clearSentryUser();
```

### Environment Variables

**Backend** (`.env`):

```env
SENTRY_DSN=https://xxx@sentry.io/project-id
NODE_ENV=production
```

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/project-id
NEXT_PUBLIC_ENV=production
```

### What Gets Tracked

**Backend:**

- ✅ 500 Internal Server Errors
- ✅ Unhandled exceptions
- ✅ Database failures
- ❌ 400 Bad Request (validation)
- ❌ 404 Not Found

**Frontend:**

- ✅ Unhandled React errors
- ✅ Network failures
- ✅ Runtime errors
- ❌ 404 page not found
- ❌ Console logs

### Production Checklist

Before deploying:

1. ✅ Add Sentry DSN to environment
2. ✅ Test error tracking
3. ✅ Verify PII sanitization
4. ✅ Set up alerts in Sentry
5. ✅ Test structured logs format

### Monitoring Dashboard

**Sentry:**

- Issues → Error tracking
- Performance → Slow requests
- Alerts → Email/Slack notifications

**Logs** (aggregator like Datadog):

```json
{
  "timestamp": "2025-12-26T02:00:00.000Z",
  "level": "error",
  "message": "Database connection failed",
  "userId": "abc123",
  "statusCode": 500
}
```

## Testing the Implementation

### 1. E2E Tests

```bash
cd portfolio-frontend
npm install
npx playwright install
npm run test:e2e
```

Expected: All tests pass ✅

### 2. Structured Logging

```bash
cd portfolio-backend
npm run start:dev

# Make API call
curl http://localhost:3000/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Check console for structured log
```

### 3. Sentry Integration

**Backend:**

1. Add `SENTRY_DSN` to `.env`
2. Start app: `npm run start:dev`
3. Trigger error
4. Check Sentry dashboard

**Frontend:**

1. Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
2. Start app: `npm run dev`
3. Trigger error
4. Check Sentry dashboard

## Troubleshooting

### E2E Tests Fail

**Problem**: Tests timeout or fail

**Solution**:

- Check both backend and frontend are running
- Verify test users exist in database
- Use `npm run test:e2e:headed` to watch
- Check `test-results/` for screenshots/videos

### "Sentry disabled" in logs

**Problem**: Sentry not initializing

**Solution**:

- Verify `SENTRY_DSN` is set
- Check DSN format
- Ensure `NODE_ENV=production` or staging

### Logs missing in production

**Problem**: No logs appearing

**Solution**:

- Check `NODE_ENV=production` is set
- Verify JSON format
- Configure log aggregator to parse JSON
- Check stdout/stderr capture

## Next Steps

1. **Extend E2E coverage** - Add edge case tests
2. **Add performance tests** - Measure page load times
3. **Set up log aggregation** - Datadog, CloudWatch
4. **Configure Sentry alerts** - Email/Slack on errors
5. **Add custom metrics** - Track business KPIs

---

**For more details:**

- Playwright docs: https://playwright.dev
- Sentry docs: https://docs.sentry.io
- NestJS logging: https://docs.nestjs.com
