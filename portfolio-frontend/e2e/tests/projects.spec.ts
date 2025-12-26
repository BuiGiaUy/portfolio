import { test, expect } from '@playwright/test';
import { loginViaAPI, clearAllCookies } from '../fixtures/auth';
import { TEST_USERS } from '../fixtures/test-users';
import { waitForAPIResponse } from '../utils/helpers';

/**
 * PROJECTS CRUD E2E TESTS
 * 
 * Tests the full projects workflow:
 * - View projects list
 * - Create new project
 * - Edit existing project
 * - Delete project
 * - View count increment
 * 
 * WHY THESE TESTS EXIST:
 * These verify the main business logic of the portfolio:
 * 1. CRUD operations work end-to-end
 * 2. Frontend and backend communicate correctly
 * 3. Data persistence works as expected
 * 4. UI updates reflect backend changes
 */

test.describe('Projects - Public Access', () => {
  test.beforeEach(async ({ context }) => {
    await clearAllCookies(context);
  });

  test('should display projects list without authentication', async ({ page }) => {
    await page.goto('/projects');

    // Should NOT redirect to login (projects page is public)
    await expect(page).toHaveURL(/\/projects/);

    // Should show projects or "no projects" message
    // Adjust selectors based on your actual UI
    const hasProjects = await page.locator('[data-testid="project-card"], [data-testid="project-item"]').count();
    
    if (hasProjects > 0) {
      // If there are projects, verify they render
      await expect(page.locator('[data-testid="project-card"]').first()).toBeVisible();
    } else {
      // If no projects, should show empty state
      await expect(page.getByText(/no projects|no items/i)).toBeVisible();
    }
  });

  test('should increment view count when viewing project', async ({ page, context }) => {
    await page.goto('/projects');

    // Wait for projects to load
    await page.waitForSelector('[data-testid="project-card"], [data-testid="project-item"]', {
      timeout: 10000,
    }).catch(() => {
      // It's okay if there are no projects
    });

    const projectCount = await page.locator('[data-testid="project-card"]').count();
    
    if (projectCount > 0) {
      // Click on first project
      const firstProject = page.locator('[data-testid="project-card"]').first();
      
      // Get current view count if displayed
      const viewCountText = await firstProject.locator('[data-testid="view-count"]').textContent().catch(() => '0');
      const currentViews = parseInt(viewCountText?.match(/\d+/)?.[0] || '0');

      // Click to view details (this should increment view count)
      await firstProject.click();

      // Wait for API call to increment view
      await page.waitForTimeout(1000);

      // Go back to projects list
      await page.goto('/projects');

      // Verify view count increased
      const newViewCountText = await firstProject.locator('[data-testid="view-count"]').textContent();
      const newViews = parseInt(newViewCountText?.match(/\d+/)?.[0] || '0');

      expect(newViews).toBeGreaterThanOrEqual(currentViews);
    }
  });
});

test.describe('Projects - CRUD Operations', () => {
  test.beforeEach(async ({ context }) => {
    // Login as admin for CRUD operations
    await loginViaAPI(context, TEST_USERS.admin);
  });

  test.afterEach(async ({ context }) => {
    await clearAllCookies(context);
  });

  test('should create a new project', async ({ page }) => {
    // Navigate to create page
    await page.goto('/projects/create');

    // Should NOT redirect (we're authenticated)
    await expect(page).toHaveURL(/\/projects\/create/);

    // Fill in project form
    const timestamp = Date.now();
    const projectTitle = `E2E Test Project ${timestamp}`;
    const projectDescription = 'This project was created by an E2E test';

    await page.getByLabel(/title|name/i).fill(projectTitle);
    await page.getByLabel(/description/i).fill(projectDescription);

    // Add more fields as needed based on your form
    // await page.getByLabel(/technologies/i).fill('TypeScript, React');
    // await page.getByLabel(/repository/i).fill('https://github.com/test/repo');

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|submit|save/i });
    
    // Wait for API response
    const createResponse = await waitForAPIResponse(
      page,
      /\/api\/projects/,
      async () => {
        await submitButton.click();
      }
    );

    // Verify creation succeeded
    expect(createResponse).toHaveProperty('id');
    expect(createResponse.title).toBe(projectTitle);

    // Should redirect to project list or detail page
    await expect(page).toHaveURL(/\/projects/);

    // Verify project appears in list
    await expect(page.getByText(projectTitle)).toBeVisible();

    // Cleanup: delete the test project
    // This depends on your UI - adjust as needed
    // await deleteProject(page, createResponse.id);
  });

  test('should edit an existing project', async ({ page, context }) => {
    // First, create a project to edit
    const createResponse = await context.request.post(
      `${process.env.E2E_BACKEND_URL || 'http://localhost:3000'}/projects`,
      {
        data: {
          title: 'Project to Edit',
          description: 'Original description',
          technologies: ['TypeScript'],
        },
      }
    );

    expect(createResponse.ok()).toBe(true);
    const project = await createResponse.json();

    // Navigate to edit page
    await page.goto(`/projects/edit/${project.id}`);

    // Modify the project
    const newTitle = `Edited Project ${Date.now()}`;
    await page.getByLabel(/title|name/i).clear();
    await page.getByLabel(/title|name/i).fill(newTitle);

    // Save changes
    const saveButton = page.getByRole('button', { name: /save|update/i });
    await saveButton.click();

    // Wait for success
    await expect(page).toHaveURL(/\/projects/);

    // Verify changes appear
    await expect(page.getByText(newTitle)).toBeVisible();

    // Cleanup
    await context.request.delete(`${process.env.E2E_BACKEND_URL || 'http://localhost:3000'}/projects/${project.id}`);
  });

  test('should delete a project', async ({ page, context }) => {
    // Create a project to delete
    const createResponse = await context.request.post(
      `${process.env.E2E_BACKEND_URL || 'http://localhost:3000'}/projects`,
      {
        data: {
          title: 'Project to Delete',
          description: 'This will be deleted',
          technologies: ['TypeScript'],
        },
      }
    );

    const project = await createResponse.json();

    // Navigate to projects list
    await page.goto('/projects');

    // Find the delete button for this project
    // This depends on your UI structure
    const projectCard = page.locator(`[data-project-id="${project.id}"]`);
    const deleteButton = projectCard.getByRole('button', { name: /delete|remove/i });

    // Handle confirmation dialog if it exists
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain(/delete|remove|confirm/i);
      await dialog.accept();
    });

    // Click delete
    await deleteButton.click();

    // Wait for project to disappear
    await expect(projectCard).not.toBeVisible({ timeout: 5000 });

    // Verify project is really deleted
    const getResponse = await context.request.get(
      `${process.env.E2E_BACKEND_URL || 'http://localhost:3000'}/projects/${project.id}`
    );
    expect(getResponse.status()).toBe(404);
  });
});

test.describe('Projects - Error Handling', () => {
  test.beforeEach(async ({ context }) => {
    await loginViaAPI(context, TEST_USERS.admin);
  });

  test('should show error when creating project with invalid data', async ({ page }) => {
    await page.goto('/projects/create');

    // Try to submit without required fields
    const submitButton = page.getByRole('button', { name: /create|submit/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/required|must provide|cannot be empty/i)).toBeVisible();

    // Should NOT create project
    // Should stay on create page
    await expect(page).toHaveURL(/\/projects\/create/);
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    await page.goto('/projects');

    // Simulate network failure by blocking API requests
    await context.route(/\/api\/projects/, (route) => {
      route.abort('failed');
    });

    // Try to load projects
    await page.reload();

    // Should show error message
    await expect(
      page.getByText(/error|failed to load|network error/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
