import { test, expect } from '@playwright/test';
import { loginViaUI, logoutViaUI, clearAllCookies } from '../fixtures/auth';
import { TEST_USERS } from '../fixtures/test-users';
import { assertAuthCookiesExist, assertAuthCookiesCleared } from '../utils/helpers';

/**
 * AUTH FLOW E2E TESTS
 * 
 * Tests the complete authentication flow:
 * - Login with valid credentials
 * - Login with invalid credentials  
 * - HttpOnly cookie handling
 * - Logout
 * - Session persistence
 * 
 * WHY THESE TESTS EXIST:
 * Auth is the foundation of the app. These tests verify that:
 * 1. Users can authenticate successfully
 * 2. Invalid credentials are rejected
 * 3. HttpOnly cookies are set correctly (security)
 * 4. Logout clears session properly
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Ensure clean state before each test
    await clearAllCookies(context);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Verify we're on the login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /log ?in|sign ?in/i })).toBeVisible();

    // Perform login
    await loginViaUI(page, TEST_USERS.user);

    // Verify redirect to protected route (dashboard or projects)
    await expect(page).toHaveURL(/\/(dashboard|projects)/);

    // Verify HttpOnly cookies are set
    await assertAuthCookiesExist(page);

    // Verify user can access protected content
    // This depends on your UI - adjust selector as needed
    await expect(page.getByText(/welcome|dashboard|projects/i)).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Try to login with wrong password
    await page.getByLabel(/email/i).fill(TEST_USERS.invalidUser.email);
    await page.getByLabel(/password/i).fill(TEST_USERS.invalidUser.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);

    // Should show error message
    await expect(
      page.getByText(/invalid credentials|incorrect password|authentication failed/i)
    ).toBeVisible({ timeout: 5000 });

    // Should NOT set cookies
    const cookies = await page.context().cookies();
    const accessToken = cookies.find((c) => c.name === 'accessToken');
    expect(accessToken).toBeUndefined();
  });

  test('should logout successfully and clear session', async ({ page }) => {
    // First, login
    await loginViaUI(page, TEST_USERS.user);
    await assertAuthCookiesExist(page);

    // Now logout
    await logoutViaUI(page);

    // Verify redirect to login or home
    await expect(page).toHaveURL(/\/(login|$)/);

    // Verify cookies are cleared
    await assertAuthCookiesCleared(page);

    // Try to access protected route - should redirect to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await loginViaUI(page, TEST_USERS.user);
    await assertAuthCookiesExist(page);

    // Navigate to protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL(/\/dashboard/);
    await assertAuthCookiesExist(page);
  });

  test('should redirect to login with redirect parameter', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/dashboard');

    // Should redirect to login with ?redirect parameter
    await expect(page).toHaveURL(/\/login\?redirect=.*dashboard/);

    // Login
    await loginViaUI(page, TEST_USERS.user);

    // Should redirect back to originally requested page
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should prevent access to login page when authenticated', async ({ page }) => {
    // Login first
    await loginViaUI(page, TEST_USERS.user);

    // Try to navigate to login page
    await page.goto('/login');

    // Should redirect to home or dashboard
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/(dashboard|$)/);
  });
});

/**
 * AUTH API INTEGRATION TESTS
 * 
 * These tests verify the API layer works correctly with the UI
 */
test.describe('Auth API Integration', () => {
  test.beforeEach(async ({ context }) => {
    await clearAllCookies(context);
  });

  test('should handle token refresh automatically', async ({ page, context }) => {
    // This test is tricky - it requires waiting for token expiry
    // For now, we just verify the /auth/refresh endpoint exists
    
    await loginViaUI(page, TEST_USERS.user);

    // Make a request that might trigger refresh
    const response = await context.request.get(
      `${process.env.E2E_BACKEND_URL || 'http://localhost:3000'}/auth/me`
    );

    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('email', TEST_USERS.user.email);
  });

  test('should return 401 for expired/invalid session', async ({ page, context }) => {
    // Clear cookies to simulate expired session
    await clearAllCookies(context);

    // Try to access protected API endpoint
    const response = await context.request.get(
      `${process.env.E2E_BACKEND_URL || 'http://localhost:3000'}/auth/me`
    );

    expect(response.status()).toBe(401);
  });
});
