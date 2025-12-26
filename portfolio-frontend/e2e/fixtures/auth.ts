import { Page, BrowserContext } from '@playwright/test';
import { TestUser, API_ENDPOINTS } from './test-users';

/**
 * Auth fixture helpers
 * 
 * These helpers handle authentication flows in tests without duplicating code.
 * They interact with the real backend API, not mocks.
 */

const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:3000';

/**
 * Login via API and get HttpOnly cookies
 * 
 * This is faster than UI login and useful for setup in protected route tests.
 */
export async function loginViaAPI(
  context: BrowserContext,
  user: TestUser
): Promise<void> {
  // Make login request
  const response = await context.request.post(`${BACKEND_URL}${API_ENDPOINTS.login}`, {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
  }

  // Cookies are automatically set in the browser context
  // No need to manually extract and set them
}

/**
 * Login via UI (for testing the login flow itself)
 */
export async function loginViaUI(
  page: Page,
  user: TestUser
): Promise<void> {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);

  // Submit form
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  // Wait for navigation (indicates successful login)
  await page.waitForURL(/\/(dashboard|projects)?/, { timeout: 5000 });
}

/**
 * Logout via UI
 */
export async function logoutViaUI(page: Page): Promise<void> {
  // Find and click logout button
  await page.getByRole('button', { name: /log ?out/i }).click();

  // Wait for redirect to login or home
  await page.waitForURL(/\/(login|$)/, { timeout: 5000 });
}

/**
 * Logout via API (for test cleanup)
 */
export async function logoutViaAPI(context: BrowserContext): Promise<void> {
  await context.request.post(`${BACKEND_URL}${API_ENDPOINTS.logout}`);
}

/**
 * Check if user is authenticated by calling /auth/me
 */
export async function isAuthenticated(context: BrowserContext): Promise<boolean> {
  const response = await context.request.get(`${BACKEND_URL}${API_ENDPOINTS.me}`);
  return response.ok();
}

/**
 * Clear all cookies (for test isolation)
 */
export async function clearAllCookies(context: BrowserContext): Promise<void> {
  await context.clearCookies();
}
