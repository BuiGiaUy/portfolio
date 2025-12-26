import { Page, expect } from '@playwright/test';

/**
 * Test utility helpers
 */

/**
 * Wait for API response and return JSON
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  action: () => Promise<void>
): Promise<any> {
  const responsePromise = page.waitForResponse(
    (response) =>
      (typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())),
    { timeout: 10000 }
  );

  await action();

  const response = await responsePromise;
  return response.json();
}

/**
 * Check if element is visible and enabled
 */
export async function isElementReady(
  page: Page,
  selector: string
): Promise<boolean> {
  const element = page.locator(selector);
  const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
  const isEnabled = await element.isEnabled({ timeout: 1000 }).catch(() => false);
  return isVisible && isEnabled;
}

/**
 * Wait for loading spinner to disappear
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  // Wait for common loading indicators to disappear
  await page.waitForSelector('[data-testid="loading"], [role="progressbar"]', {
    state: 'hidden',
    timeout: 10000,
  }).catch(() => {
    // It's okay if loading indicator doesn't exist
  });
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Check for console errors (useful for debugging)
 */
export function setupConsoleErrorListener(page: Page): void {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
    }
  });

  page.on('pageerror', (error) => {
    console.error('Page error:', error.message);
  });
}

/**
 * Assert that cookies are set correctly
 */
export async function assertAuthCookiesExist(page: Page): Promise<void> {
  const cookies = await page.context().cookies();
  const accessToken = cookies.find((c) => c.name === 'accessToken');
  const refreshToken = cookies.find((c) => c.name === 'refreshToken');

  expect(accessToken, 'accessToken cookie should exist').toBeDefined();
  expect(refreshToken, 'refreshToken cookie should exist').toBeDefined();
  expect(accessToken?.httpOnly, 'accessToken should be HttpOnly').toBe(true);
  expect(refreshToken?.httpOnly, 'refreshToken should be HttpOnly').toBe(true);
}

/**
 * Assert that cookies are cleared
 */
export async function assertAuthCookiesCleared(page: Page): Promise<void> {
  const cookies = await page.context().cookies();
  const accessToken = cookies.find((c) => c.name === 'accessToken');
  const refreshToken = cookies.find((c) => c.name === 'refreshToken');

  expect(accessToken, 'accessToken cookie should be cleared').toBeUndefined();
  expect(refreshToken, 'refreshToken cookie should be cleared').toBeUndefined();
}
