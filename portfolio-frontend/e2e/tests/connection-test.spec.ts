import { test, expect } from '@playwright/test';

/**
 * Simple connection test
 */

test('backend health check', async ({ request }) => {
  const response = await request.get('http://localhost:3000/health');
  console.log('Health check status:', response.status());
  console.log('Health check body:', await response.text());
  expect(response.ok()).toBe(true);
});

test('can reach login endpoint', async ({ request }) => {
  const response = await request.post('http://localhost:3000/auth/login', {
    data: {
      email: 'test@test.com',
      password: 'wrongpassword',
    },
  });
  console.log('Login attempt status:', response.status());
  console.log('Login response:', await response.text());
  // Should get 401 for invalid credentials
  expect([400, 401]).toContain(response.status());
});
