# API Client Layer Documentation

## 🎯 Overview

A production-ready API client layer built with Axios featuring:

- ✅ **Automatic token attachment** to all authenticated requests
- ✅ **Auto-refresh on 401** with token refresh flow
- ✅ **Retry logic** with exponential backoff for failed requests
- ✅ **Centralized error handling** with user-friendly messages
- ✅ **TypeScript support** with full type safety
- ✅ **React hooks** for easy integration

## 📁 Structure

```
lib/api/
├── index.ts              # Main entry point
├── client.ts             # Axios instance with interceptors
├── auth.service.ts       # Authentication service
├── token-manager.ts      # Token storage management
├── error-handler.ts      # Centralized error handling
├── config.ts             # API configuration
├── types.ts              # TypeScript types
└── hooks.ts              # React hooks
```

## 🚀 Quick Start

### 1. Basic API Request

```typescript
import { apiClient } from "@/lib/api";

// GET request
const data = await apiClient.get("/projects");

// POST request
const newProject = await apiClient.post("/projects", {
  title: "My Project",
  description: "Description",
});

// PUT request
const updated = await apiClient.put("/projects/1", { title: "Updated" });

// DELETE request
await apiClient.delete("/projects/1");
```

### 2. Authentication

```typescript
import { authService } from "@/lib/api";

// Login
const response = await authService.login({
  email: "user@example.com",
  password: "password123",
});

// Register
const newUser = await authService.register({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
});

// Logout
await authService.logout();

// Check authentication
const isAuth = authService.isAuthenticated();

// Get current user
const user = await authService.getCurrentUser();
```

### 3. React Hooks

```typescript
"use client";

import { useAuth } from "@/lib/api";

export default function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: "user@example.com",
        password: "password123",
      });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## 🔐 Authentication Flow

### How It Works

1. **Login** → Tokens stored in localStorage
2. **Request** → Access token automatically attached
3. **401 Error** → Auto-refresh token
4. **Retry** → Original request retried with new token
5. **Refresh Failed** → Logout and redirect to login

### Token Management

```typescript
import { tokenManager } from "@/lib/api";

// Get tokens
const accessToken = tokenManager.getAccessToken();
const refreshToken = tokenManager.getRefreshToken();

// Get user
const user = tokenManager.getUser();

// Check authentication
const isAuth = tokenManager.isAuthenticated();

// Clear auth data
tokenManager.clearAuthData();
```

## 🔄 Auto-Refresh on 401

The API client automatically handles token refresh:

```typescript
// This happens automatically!
// 1. Request fails with 401
// 2. Client calls /auth/refresh with refresh token
// 3. New access token received
// 4. Original request retried with new token
// 5. If refresh fails, user is logged out
```

## 🔁 Retry Logic

Failed requests are automatically retried with exponential backoff:

```typescript
// Retryable status codes: 408, 429, 500, 502, 503, 504
// Max retries: 3 (configurable)
// Delay: 1s, 2s, 4s (exponential backoff)

// Example: Request fails with 503
// → Retry 1 after 1s
// → Retry 2 after 2s
// → Retry 3 after 4s
// → If still failing, throw error
```

### Custom Retry Configuration

```typescript
// Override max retries for specific request
await apiClient.get("/projects", {
  maxRetries: 5,
});

// Skip retries
await apiClient.get("/projects", {
  maxRetries: 0,
});
```

## ⚠️ Error Handling

### Centralized Error Handling

All errors are handled consistently:

```typescript
import { ApiClientError, ErrorCode } from "@/lib/api";

try {
  await apiClient.get("/projects");
} catch (error) {
  if (error instanceof ApiClientError) {
    console.log(error.message); // User-friendly message
    console.log(error.statusCode); // HTTP status code
    console.log(error.code); // Error code enum
    console.log(error.details); // Additional details
  }
}
```

### Error Codes

```typescript
enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}
```

### User-Friendly Messages

Errors are automatically converted to user-friendly messages:

- `401` → "Your session has expired. Please log in again."
- `403` → "You do not have permission to perform this action."
- `404` → "The requested resource was not found."
- `422/400` → "Please check your input and try again."
- `500/502/503/504` → "A server error occurred. Please try again later."
- Network error → "Network error. Please check your connection."
- Timeout → "Request timed out. Please try again."

## 🎣 React Hooks

### useAuth

Main authentication hook:

```typescript
const {
  user, // Current user object
  isAuthenticated, // Boolean
  isLoading, // Boolean
  error, // ApiClientError | null
  login, // (credentials) => Promise<AuthResponse>
  register, // (data) => Promise<AuthResponse>
  logout, // () => Promise<void>
  refreshUser, // () => Promise<AuthUser>
  clearError, // () => void
  hasRole, // (role: string) => boolean
  hasAnyRole, // (roles: string[]) => boolean
  hasAllRoles, // (roles: string[]) => boolean
} = useAuth();
```

### useRequireAuth

Redirects to login if not authenticated:

```typescript
function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth("/login");

  if (isLoading) return <div>Loading...</div>;

  return <div>Protected content</div>;
}
```

### useRequireRole

Redirects if user doesn't have required role:

```typescript
function AdminPage() {
  const { hasRole, isLoading } = useRequireRole("admin", "/unauthorized");

  if (isLoading) return <div>Loading...</div>;

  return <div>Admin content</div>;
}
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### API Configuration

Edit `lib/api/config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000,

  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },

  auth: {
    tokenKey: "access_token",
    refreshTokenKey: "refresh_token",
    userKey: "user",
    tokenPrefix: "Bearer",
  },

  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },
};
```

## 🔧 Advanced Usage

### Skip Authentication

```typescript
// Skip auth for public endpoints
await apiClient.get("/public/projects", {
  skipAuth: true,
});
```

### Skip Token Refresh

```typescript
// Skip auto-refresh (e.g., for refresh endpoint itself)
await apiClient.post("/auth/refresh", data, {
  skipAuth: true,
  skipRefresh: true,
});
```

### Custom Headers

```typescript
await apiClient.get("/projects", {
  headers: {
    "X-Custom-Header": "value",
  },
});
```

### Access Raw Axios Instance

```typescript
import { apiClient } from "@/lib/api";

const axios = apiClient.getAxiosInstance();
// Use axios directly for advanced use cases
```

## 🎯 Role-Based Access Control

```typescript
import { authService } from "@/lib/api";

// Check single role
if (authService.hasRole("admin")) {
  // Show admin features
}

// Check any role
if (authService.hasAnyRole(["admin", "moderator"])) {
  // Show moderation features
}

// Check all roles
if (authService.hasAllRoles(["admin", "superuser"])) {
  // Show super admin features
}
```

## 📡 Auth Events

Listen to authentication events:

```typescript
// Login event
window.addEventListener("auth:login", (event: CustomEvent<AuthUser>) => {
  console.log("User logged in:", event.detail);
});

// Logout event
window.addEventListener("auth:logout", (event: CustomEvent) => {
  console.log("User logged out:", event.detail.reason);
  // Reasons: 'user_logout', 'token_refresh_failed'
});
```

## 🧪 Example: Complete Login Form

```typescript
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/api";

export default function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      // Redirect or show success
    } catch (err) {
      // Error is already in state
      console.error("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error.message}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={isLoading}
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        disabled={isLoading}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

## 🎨 Example: Protected Route

```typescript
"use client";

import { useRequireAuth } from "@/lib/api";
import { projectService } from "@/services/project.service";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Protected Content</h1>
      {/* Your protected content */}
    </div>
  );
}
```

## 📊 Benefits

1. ✅ **Zero Configuration** - Works out of the box
2. ✅ **Type Safety** - Full TypeScript support
3. ✅ **Automatic Token Management** - No manual token handling
4. ✅ **Resilient** - Auto-retry and error recovery
5. ✅ **User-Friendly** - Clear error messages
6. ✅ **Production Ready** - Battle-tested patterns
7. ✅ **Extensible** - Easy to customize

## 🚨 Important Notes

- Tokens are stored in `localStorage` (consider `httpOnly` cookies for production)
- Auto-refresh happens on first 401 error
- Failed refresh triggers automatic logout
- All errors are logged in development mode
- Network errors don't trigger retries by default

## 📝 Next Steps

1. ✅ Set `NEXT_PUBLIC_API_URL` in `.env.local`
2. ✅ Use `apiClient` for all API calls
3. ✅ Use `useAuth` hook in components
4. ✅ Handle errors with try/catch
5. ✅ Test authentication flow
6. ✅ Deploy to production

---

**Need help?** Check the inline code documentation or refer to this guide!
