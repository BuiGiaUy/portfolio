# API Client - Quick Reference Card

## 🚀 Quick Start

```typescript
// 1. Import
import { apiClient, useAuth, authService } from "@/lib/api";

// 2. Make requests
const data = await apiClient.get("/endpoint");

// 3. Use authentication
const { user, login, logout } = useAuth();
```

## 📚 Common Imports

```typescript
// API Client
import { apiClient } from "@/lib/api";

// Authentication
import { authService, useAuth } from "@/lib/api";

// Error Handling
import { ApiClientError, ErrorCode } from "@/lib/api";

// Types
import type { AuthUser, LoginCredentials } from "@/lib/api";
```

## 🔧 API Client Methods

```typescript
// GET
const data = await apiClient.get<T>("/endpoint");

// POST
const result = await apiClient.post<T>("/endpoint", { data });

// PUT
const updated = await apiClient.put<T>("/endpoint", { data });

// PATCH
const patched = await apiClient.patch<T>("/endpoint", { data });

// DELETE
await apiClient.delete("/endpoint");
```

## 🔐 Authentication

### Login

```typescript
await authService.login({ email, password });
```

### Register

```typescript
await authService.register({ email, password, name });
```

### Logout

```typescript
await authService.logout();
```

### Check Auth

```typescript
const isAuth = authService.isAuthenticated();
```

### Get Current User

```typescript
const user = await authService.getCurrentUser();
```

### Role Checks

```typescript
authService.hasRole("admin");
authService.hasAnyRole(["admin", "moderator"]);
authService.hasAllRoles(["admin", "superuser"]);
```

## 🎣 React Hooks

### useAuth

```typescript
const {
  user, // Current user
  isAuthenticated, // Auth status
  isLoading, // Loading state
  error, // Error state
  login, // Login function
  register, // Register function
  logout, // Logout function
  refreshUser, // Refresh user data
  clearError, // Clear error
  hasRole, // Check role
  hasAnyRole, // Check any role
  hasAllRoles, // Check all roles
} = useAuth();
```

### useRequireAuth

```typescript
const { isAuthenticated, isLoading } = useRequireAuth("/login");
```

### useRequireRole

```typescript
const { hasRole, isLoading } = useRequireRole("admin", "/unauthorized");
```

## ⚠️ Error Handling

```typescript
try {
  await apiClient.get("/endpoint");
} catch (error) {
  if (error instanceof ApiClientError) {
    console.log(error.message); // User-friendly message
    console.log(error.statusCode); // HTTP status
    console.log(error.code); // ErrorCode enum
    console.log(error.details); // Additional details
  }
}
```

## 🔄 Request Options

```typescript
// Skip authentication
await apiClient.get("/public", { skipAuth: true });

// Skip token refresh
await apiClient.post("/auth/refresh", data, {
  skipAuth: true,
  skipRefresh: true,
});

// Custom retry count
await apiClient.get("/endpoint", { maxRetries: 5 });

// Custom headers
await apiClient.get("/endpoint", {
  headers: { "X-Custom": "value" },
});
```

## 🎯 Common Patterns

### Pattern 1: Simple Request

```typescript
const projects = await apiClient.get("/projects");
```

### Pattern 2: With Error Handling

```typescript
try {
  const data = await apiClient.post("/projects", project);
  console.log("Success:", data);
} catch (error) {
  console.error("Failed:", error.message);
}
```

### Pattern 3: In Component

```typescript
function MyComponent() {
  const { user, isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => login(creds)}>Login</button>;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

### Pattern 4: Protected Route

```typescript
function ProtectedPage() {
  useRequireAuth("/login");

  return <div>Protected content</div>;
}
```

### Pattern 5: Role-Based Content

```typescript
function AdminPanel() {
  const { hasRole } = useAuth();

  if (!hasRole("admin")) {
    return <div>Access denied</div>;
  }

  return <div>Admin panel</div>;
}
```

## 📡 Auth Events

```typescript
// Listen for login
window.addEventListener("auth:login", (e: CustomEvent<AuthUser>) => {
  console.log("User logged in:", e.detail);
});

// Listen for logout
window.addEventListener("auth:logout", (e: CustomEvent) => {
  console.log("User logged out:", e.detail.reason);
});
```

## ⚙️ Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### API Config

```typescript
// lib/api/config.ts
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
};
```

## 🔍 Error Codes

```typescript
enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED", // 401
  FORBIDDEN = "FORBIDDEN", // 403
  NOT_FOUND = "NOT_FOUND", // 404
  VALIDATION_ERROR = "VALIDATION_ERROR", // 400, 422
  SERVER_ERROR = "SERVER_ERROR", // 500, 502, 503, 504
  NETWORK_ERROR = "NETWORK_ERROR", // No response
  TIMEOUT = "TIMEOUT", // 408
  UNKNOWN = "UNKNOWN", // Other
}
```

## 📊 TypeScript Types

```typescript
// Login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Auth response
interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// User
interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

// API Error
class ApiClientError extends Error {
  statusCode: number;
  code: ErrorCode;
  details?: unknown;
}
```

## 🎯 Best Practices

### ✅ DO

- Use `apiClient` for all API calls
- Use `useAuth` hook in components
- Handle errors with try/catch
- Use TypeScript types
- Check authentication before protected actions

### ❌ DON'T

- Don't use `fetch` directly
- Don't manage tokens manually
- Don't ignore errors
- Don't skip type checking
- Don't hardcode API URLs

## 🔗 Related Files

- **Main Entry**: `lib/api/index.ts`
- **Client**: `lib/api/client.ts`
- **Auth Service**: `lib/api/auth.service.ts`
- **Hooks**: `lib/api/hooks.ts`
- **Config**: `lib/api/config.ts`
- **Types**: `lib/api/types.ts`

## 📖 Documentation

- **Full Guide**: `API_CLIENT_GUIDE.md`
- **Architecture**: `API_CLIENT_ARCHITECTURE.md`
- **Summary**: `API_CLIENT_SUMMARY.md`
- **README**: `lib/api/README.md`

---

**Quick Tips:**

- All requests auto-attach tokens ✅
- 401 errors auto-refresh tokens ✅
- Failed requests auto-retry ✅
- Errors are user-friendly ✅
- Full TypeScript support ✅
