import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * 
 * This config is designed for testing the full auth flow with HttpOnly cookies.
 * We test against the real backend, not mocks.
 */
export default defineConfig({
  testDir: './e2e/tests',
  
  // Maximum time one test can run
  timeout: 30 * 1000,
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  
  use: {
    // Base URL for tests
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',
    
    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Browser context options
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Accept cookies (critical for HttpOnly auth)
    acceptDownloads: true,
  },

  // Run only on Chromium for speed (minimal test suite)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
