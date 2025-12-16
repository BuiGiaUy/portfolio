# API Client Implementation Guide

## ✅ What's Been Implemented

### 1. **Core API Client** (`lib/api/client.ts`)

- ✅ Axios instance with custom configuration
- ✅ Request interceptor for automatic token attachment
- ✅ Response interceptor for 401 handling
- ✅ Automatic token refresh on 401 errors
- ✅ Retry logic with exponential backoff
- ✅ Support for GET, POST, PUT, PATCH, DELETE methods

### 2. **Token Management** (`lib/api/token-manager.ts`)

- ✅ Secure token storage in localStorage
- ✅ Access token management
- ✅ Refresh token management
- ✅ User data persistence
- ✅ Authentication state checking
- ✅ Authorization header generation

### 3. **Authentication Service** (`lib/api/auth.service.ts`)

- ✅ Login functionality
- ✅ Register functionality
- ✅ Logout functionality
- ✅ Token refresh
- ✅ Get current user
- ✅ Role-based access control (RBAC)
  - `hasRole(role)` - Check single role
  - `hasAnyRole(roles)` - Check any role
  - `hasAllRoles(roles)` - Check all roles

### 4. **Error Handling** (`lib/api/error-handler.ts`)

- ✅ Centralized error handling
- ✅ User-friendly error messages
- ✅ Error code mapping
- ✅ Retryable error detection
- ✅ Auth error detection
- ✅ Development logging

### 5. **React Hooks** (`lib/api/hooks.ts`)

- ✅ `useAuth` - Main authentication hook
- ✅ `useRequireAuth` - Protected route hook
- ✅ `useRequireRole` - Role-based protection hook
- ✅ Event-based auth state synchronization

### 6. **Configuration** (`lib/api/config.ts`)

- ✅ Environment-based API URL
- ✅ Timeout configuration
- ✅ Retry configuration
- ✅ Auth endpoint configuration
- ✅ Default headers

### 7. **TypeScript Types** (`lib/api/types.ts`)

- ✅ API response types
- ✅ Authentication types
- ✅ Error types
- ✅ Request configuration types
- ✅ Custom error class

### 8. **Updated Services**

- ✅ `services/project.service.ts` - Updated to use new API client

### 9. **Example Components**

- ✅ `app/login-example/page.tsx` - Login form example
- ✅ `app/dashboard-example/page.tsx` - Protected dashboard example

## 🎯 Key Features

### Auto Token Attachment

```typescript
// Automatically attaches Bearer token to all requests
await apiClient.get("/projects");
// Request headers: { Authorization: 'Bearer <token>' }
```

### Auto Refresh on 401

```typescript
// 1. Request fails with 401
// 2. Automatically calls /auth/refresh
// 3. Gets new access token
// 4. Retries original request
// 5. Returns successful response

// All happens automatically - no code needed!
```

### Retry with Exponential Backoff

```typescript
// Retries failed requests automatically
// Status codes: 408, 429, 500, 502, 503, 504
// Delays: 1s → 2s → 4s (exponential)
// Max retries: 3 (configurable)
```

### Centralized Error Handling

```typescript
try {
  await apiClient.get("/projects");
} catch (error) {
  // error.message = "User-friendly message"
  // error.statusCode = HTTP status code
  // error.code = ErrorCode enum
  // error.details = Additional details
}
```

## 📚 Usage Examples

### 1. Basic API Request

```typescript
import { apiClient } from "@/lib/api";

// GET
const projects = await apiClient.get("/projects");

// POST
const newProject = await apiClient.post("/projects", {
  title: "My Project",
  description: "Description",
});

// PUT
const updated = await apiClient.put("/projects/1", { title: "Updated" });

// DELETE
await apiClient.delete("/projects/1");
```

### 2. Authentication

```typescript
import { authService } from "@/lib/api";

// Login
await authService.login({
  email: "user@example.com",
  password: "password",
});

// Check authentication
const isAuth = authService.isAuthenticated();

// Get current user
const user = authService.getCurrentUser();

// Logout
await authService.logout();
```

### 3. React Component with Auth

```typescript
"use client";

import { useAuth } from "@/lib/api";

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <button onClick={() => login(credentials)}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 4. Protected Route

```typescript
"use client";

import { useRequireAuth } from "@/lib/api";

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth("/login");

  if (isLoading) return <div>Loading...</div>;

  return <div>Protected content</div>;
}
```

### 5. Role-Based Access

```typescript
import { authService } from "@/lib/api";

// Check role
if (authService.hasRole("admin")) {
  // Show admin features
}

// Check multiple roles
if (authService.hasAnyRole(["admin", "moderator"])) {
  // Show moderation features
}
```

## 🔧 Configuration

### 1. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Customize Retry Settings

Edit `lib/api/config.ts`:

```typescript
retry: {
  maxRetries: 5,           // Increase max retries
  retryDelay: 2000,        // Increase base delay
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}
```

### 3. Customize Auth Endpoints

Edit `lib/api/config.ts`:

```typescript
endpoints: {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
}
```

## 🎨 Example Pages

Visit these routes to see examples:

- `/login-example` - Login form with error handling
- `/dashboard-example` - Protected dashboard with user info

## 🔐 Security Notes

1. **Token Storage**: Currently uses `localStorage`. For production, consider:

   - HttpOnly cookies (more secure)
   - Secure cookie flags
   - SameSite cookie attribute

2. **Token Refresh**: Automatically refreshes on 401

   - Uses refresh token from localStorage
   - Updates both access and refresh tokens
   - Logs out user if refresh fails

3. **HTTPS**: Always use HTTPS in production

## 🚀 Next Steps

1. **Set Environment Variable**

   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

2. **Use in Your Components**

   ```typescript
   import { apiClient, useAuth } from "@/lib/api";
   ```

3. **Test Authentication Flow**

   - Visit `/login-example`
   - Login with credentials
   - Visit `/dashboard-example`
   - See protected content

4. **Update Your Services**

   - Replace `fetch` with `apiClient`
   - Remove manual token handling
   - Let interceptors handle auth

5. **Handle Errors**
   ```typescript
   try {
     await apiClient.get("/projects");
   } catch (error) {
     console.error(error.message); // User-friendly message
   }
   ```

## 📊 Architecture

```
Component
    ↓
useAuth Hook / apiClient
    ↓
Interceptors (Request/Response)
    ↓
Token Manager
    ↓
Auth Service
    ↓
Backend API
```

## ✅ Checklist

- [x] Install Axios
- [x] Create API client with interceptors
- [x] Implement token management
- [x] Create auth service
- [x] Implement error handling
- [x] Create React hooks
- [x] Add TypeScript types
- [x] Create configuration
- [x] Update project service
- [x] Create example components
- [x] Write documentation

## 🎉 You're Ready!

The API client layer is fully implemented and ready to use. All requests will:

1. ✅ Automatically attach access tokens
2. ✅ Auto-refresh on 401 errors
3. ✅ Retry failed requests
4. ✅ Handle errors gracefully
5. ✅ Provide user-friendly messages

Start using it in your components with:

```typescript
import { apiClient, useAuth, authService } from "@/lib/api";
```

Happy coding! 🚀
