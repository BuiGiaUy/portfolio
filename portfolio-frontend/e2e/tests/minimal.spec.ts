import { test, expect } from '@playwright/test';
import { loginViaUI, logoutViaUI, clearAllCookies } from '../fixtures/auth';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * MINIMAL E2E TESTS
 * 
 * Only 2 essential tests:
 * 1. Login → View Project → Logout
 * 2. Open Project Detail → View Count Increment
 */

test.describe('Minimal E2E Suite', () => {
  test.beforeEach(async ({ context }) => {
    await clearAllCookies(context);
  });

  test('Test 1: Login → View Project → Logout', async ({ page }) => {
    // Step 1: Login
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('#email', TEST_USERS.admin.email);
    await page.fill('#password', TEST_USERS.admin.password);
    
    // Click submit and wait for navigation
    await Promise.all([
      page.waitForURL(/\/(dashboard|projects|$)/, { timeout: 10000 }),
      page.click('button[type="submit"]'),
    ]);
    
    // Verify we're not on login page anymore
    await expect(page).not.toHaveURL(/\/login/);
    
    // Step 2: View Project
    // Navigate to home page
    await page.goto('/');
    
    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });
    
    // Click on first project
    const firstProject = page.locator('[data-testid="project-card"]').first();
    await firstProject.click();
    
    // Wait for navigation to project detail
    await page.waitForURL(/\/projects\/.+/, { timeout: 10000 });
    
    // Step 3: Logout
    // Find logout button (could be in navbar or menu)
    const logoutButton = page.getByRole('button', { name: /log ?out/i });
    await logoutButton.click();
    
    // Verify logout successful
    await page.waitForURL(/\/(login|$)/, { timeout: 5000 });
  });

  test('Test 2: Open Project Detail → View Count Increment', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    
    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });
    
    // Get first project card
    const firstProject = page.locator('[data-testid="project-card"]').first();
    
    // Get initial view count
    const viewCountElement = firstProject.locator('[data-testid="view-count"]');
    const initialViewText = await viewCountElement.textContent();
    const initialViews = parseInt(initialViewText?.match(/\d+/)?.[0] || '0');
    
    // Click on project and wait for navigation
    await Promise.all([
      page.waitForURL(/\/projects\/.+/, { timeout: 10000 }),
      firstProject.click(),
    ]);
    
    // Wait for view increment API call
    await page.waitForTimeout(2000);
    
    // Go back to home
    await page.goto('/');
    
    // Wait for projects to reload
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });
    
    // Get new view count
    const newProjectCard = page.locator('[data-testid="project-card"]').first();
    const newViewCountElement = newProjectCard.locator('[data-testid="view-count"]');
    const newViewText = await newViewCountElement.textContent();
    const newViews = parseInt(newViewText?.match(/\d+/)?.[0] || '0');
    
    // Verify view count increased
    expect(newViews).toBeGreaterThan(initialViews);
  });
});
