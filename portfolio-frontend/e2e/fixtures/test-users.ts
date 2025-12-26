/**
 * Test user data
 * 
 * IMPORTANT: These users should exist in your test database.
 * Run the backend seed script before E2E tests.
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export const TEST_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!@#',
    role: 'admin' as const,
  },
  user: {
    email: 'user@example.com',
    password: 'User123!@#',
    role: 'user' as const,
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword123',
    role: 'user' as const,
  },
} as const;

export const API_ENDPOINTS = {
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',
  refresh: '/auth/refresh',
  projects: '/projects',
} as const;
