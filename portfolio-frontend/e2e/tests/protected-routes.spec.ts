import { test, expect } from '@playwright/test';
import { loginViaAPI, clearAllCookies } from '../fixtures/auth';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * PROTECTED ROUTES E2E TESTS
 * 
 * Tests that route protection middleware works correctly:
 * - Unauthenticated users cannot access protected routes
 * - Authenticated users can access protected routes
 * - Middleware redirects work correctly
 * 
 * WHY THESE TESTS EXIST:
 * Route protection is critical for security. These tests verify that:
 * 1. Unauthorized users are blocked from sensitive pages
 * 2. Middleware-based auth works as expected
 * 3. Redirect flows are correct
 */

const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects/create',
  '/projects/edit',
  '/admin',
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/projects',
  '/health',
];

test.describe('Protected Routes - Unauthenticated', () => {
  test.beforeEach(async ({ context }) => {
    // Ensure user is NOT authenticated
    await clearAllCookies(context);
  });

  for (const route of PROTECTED_ROUTES) {
    test(`should redirect ${route} to login when not authenticated`, async ({ page }) => {
      await page.goto(route);

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Should include redirect parameter
      const url = new URL(page.url());
      expect(url.searchParams.get('redirect')).toContain(route);
    });
  }

  for (const route of PUBLIC_ROUTES) {
    test(`should allow access to public route ${route}`, async ({ page }) => {
      await page.goto(route);

      // Should NOT redirect
      await expect(page).toHaveURL(new RegExp(route === '/' ? '^/$' : route));

      // Should render content (not error page)
      const content = await page.textContent('body');
      expect(content).not.toContain('404');
      expect(content).not.toContain('Not Found');
    });
  }
});

test.describe('Protected Routes - Authenticated', () => {
  test.beforeEach(async ({ context }) => {
    // Login before each test
    await loginViaAPI(context, TEST_USERS.user);
  });

  test.afterEach(async ({ context }) => {
    // Cleanup after each test
    await clearAllCookies(context);
  });

  for (const route of PROTECTED_ROUTES) {
    test(`should allow access to ${route} when authenticated`, async ({ page }) => {
      await page.goto(route);

      // Should NOT redirect to login
      await expect(page).not.toHaveURL(/\/login/);

      // Should show the protected content
      // Note: Exact assertion depends on your page structure
      // Adjust as needed
      const content = await page.textContent('body');
      expect(content).not.toContain('Log in');
      expect(content).not.toContain('Sign in');
    });
  }

  test('should prevent authenticated users from accessing /login', async ({ page }) => {
    await page.goto('/login');

    // Should redirect away from login
    await expect(page).not.toHaveURL(/\/login/);

    // Should redirect to home or dashboard
    await expect(page).toHaveURL(/\/(dashboard|$)/);
  });
});

test.describe('Protected Routes - Session Expiry', () => {
  test('should redirect to login when session expires during navigation', async ({ page, context }) => {
    // Login first
    await loginViaAPI(context, TEST_USERS.user);

    // Navigate to protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Simulate session expiry by clearing cookies
    await clearAllCookies(context);

    // Try to navigate to another protected page
    await page.goto('/projects/create');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

/**
 * MIDDLEWARE INTEGRATION TESTS
 * 
 * These verify that Next.js middleware works correctly
 */
test.describe('Middleware Integration', () => {
  test('should set security headers on all responses', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();
    const headers = response!.headers();

    // Verify security headers are set
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('should handle nested protected routes correctly', async ({ page, context }) => {
    // Test route like /dashboard/settings or /projects/create/new
    await clearAllCookies(context);

    // Try nested protected route
    await page.goto('/projects/create/new');

    // Should redirect to login with full path
    await expect(page).toHaveURL(/\/login/);
    const url = new URL(page.url());
    expect(url.searchParams.get('redirect')).toContain('/projects/create');
  });
});
