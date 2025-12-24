/**
 * Cookie Utility Functions
 * Helper functions for managing cookies on the client side
 */

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  
  return document.cookie.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name) {
      cookies[name] = value || '';
    }
    return cookies;
  }, {} as Record<string, string>);
}

/**
 * Get a specific cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = getAllCookies();
  return cookies[name] || null;
}

/**
 * Delete a cookie
 * @param name - Cookie name
 * @param options - Cookie options (path, domain, etc.)
 */
export function deleteCookie(
  name: string,
  options: {
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): void {
  if (typeof document === 'undefined') return;

  const { path = '/', domain, secure, sameSite = 'Lax' } = options;

  let cookieString = `${name}=; max-age=-1; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  if (sameSite) {
    cookieString += `; SameSite=${sameSite}`;
  }
  
  if (secure) {
    cookieString += `; Secure`;
  }

  // Try both with and without Secure flag
  document.cookie = cookieString;
  if (secure !== false) {
    document.cookie = cookieString + '; Secure';
  }
}

/**
 * Clear all auth-related cookies
 */
export function clearAuthCookies(): void {
  const cookieNames = ['accessToken', 'refreshToken'];
  
  cookieNames.forEach((name) => {
    // Try multiple combinations to ensure deletion
    deleteCookie(name, { path: '/', sameSite: 'Lax', secure: false });
    deleteCookie(name, { path: '/', sameSite: 'Lax', secure: true });
    deleteCookie(name, { path: '/', sameSite: 'Strict', secure: false });
    deleteCookie(name, { path: '/', sameSite: 'Strict', secure: true });
    deleteCookie(name, { path: '/', sameSite: 'None', secure: true });
  });
}

/**
 * Check if auth cookies exist
 */
export function hasAuthCookies(): boolean {
  const cookies = getAllCookies();
  return !!(cookies.accessToken || cookies.refreshToken);
}

/**
 * Log all cookies (for debugging)
 */
export function logCookies(): void {
  if (typeof console === 'undefined') return;
  
  const cookies = getAllCookies();
  console.log('🍪 Current Cookies:', cookies);
  console.log('🔐 Has Auth Cookies:', hasAuthCookies());
}
