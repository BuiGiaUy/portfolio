# API Client Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Components                         │
│  (Login, Dashboard, Protected Routes, Public Pages)             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─────────────────┬─────────────────┐
                         ▼                 ▼                 ▼
              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
              │   useAuth    │  │ useProjects  │  │  apiClient   │
              │     Hook     │  │     Hook     │  │   Methods    │
              └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                     │                 │                 │
                     └────────┬────────┴────────┬────────┘
                              ▼                 ▼
                   ┌──────────────────┬──────────────────┐
                   │  Auth Service    │  Project Service │
                   └────────┬─────────┴────────┬─────────┘
                            │                  │
                            └────────┬─────────┘
                                     ▼
                          ┌────────────────────┐
                          │    API Client      │
                          │  (Axios Instance)  │
                          └─────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │   Request    │ │   Response   │ │    Error     │
          │ Interceptor  │ │ Interceptor  │ │   Handler    │
          └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                 │                │                │
                 ▼                ▼                ▼
          ┌──────────────────────────────────────────────┐
          │           Token Manager                      │
          │  (localStorage: access + refresh tokens)     │
          └──────────────────┬───────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Backend API        │
                  │  /auth/login         │
                  │  /auth/refresh       │
                  │  /auth/logout        │
                  │  /projects/*         │
                  └──────────────────────┘
```

## 🔄 Request Flow

### Normal Request Flow

```
1. Component calls apiClient.get('/projects')
2. Request Interceptor attaches Authorization header
3. Request sent to backend
4. Response received
5. Data returned to component
```

### 401 Error Flow (Token Refresh)

```
1. Component calls apiClient.get('/projects')
2. Request Interceptor attaches (expired) token
3. Request sent to backend
4. Backend returns 401 Unauthorized
5. Response Interceptor catches 401
6. Check if already refreshing
   ├─ Yes → Queue request, wait for new token
   └─ No  → Call /auth/refresh endpoint
7. Receive new access + refresh tokens
8. Update tokens in localStorage
9. Retry original request with new token
10. Return successful response to component
```

### Retry Flow (Server Error)

```
1. Component calls apiClient.get('/projects')
2. Request sent to backend
3. Backend returns 500/502/503/504
4. Response Interceptor catches error
5. Check retry count < maxRetries
6. Wait with exponential backoff (1s, 2s, 4s)
7. Retry request
8. If successful → return data
9. If failed again → repeat until maxRetries
10. If all retries fail → throw error
```

## 🔐 Authentication Flow

### Login Flow

```
User enters credentials
       ↓
authService.login({ email, password })
       ↓
POST /auth/login (skipAuth: true)
       ↓
Backend validates credentials
       ↓
Returns { user, accessToken, refreshToken }
       ↓
tokenManager stores tokens + user
       ↓
Emit 'auth:login' event
       ↓
useAuth hook updates state
       ↓
Component re-renders with authenticated state
```

### Logout Flow

```
User clicks logout
       ↓
authService.logout()
       ↓
POST /auth/logout (with refreshToken)
       ↓
tokenManager.clearAuthData()
       ↓
Emit 'auth:logout' event
       ↓
useAuth hook updates state
       ↓
Component re-renders with unauthenticated state
       ↓
Redirect to login page
```

### Auto-Refresh Flow

```
Request fails with 401
       ↓
Response Interceptor catches error
       ↓
Check if already refreshing
       ↓
If not, set isRefreshing = true
       ↓
POST /auth/refresh (skipAuth: true, skipRefresh: true)
       ↓
Backend validates refresh token
       ↓
Returns { accessToken, refreshToken }
       ↓
tokenManager updates tokens
       ↓
Notify all queued requests with new token
       ↓
Retry original request with new token
       ↓
If refresh fails:
  ├─ Clear all tokens
  ├─ Emit 'auth:logout' event
  └─ Redirect to login
```

## 📊 Component Interaction

### useAuth Hook

```
Component
    ↓
useAuth()
    ├─ user: AuthUser | null
    ├─ isAuthenticated: boolean
    ├─ isLoading: boolean
    ├─ error: ApiClientError | null
    ├─ login(credentials)
    ├─ register(data)
    ├─ logout()
    ├─ refreshUser()
    ├─ clearError()
    ├─ hasRole(role)
    ├─ hasAnyRole(roles)
    └─ hasAllRoles(roles)
```

### useRequireAuth Hook

```
Component
    ↓
useRequireAuth('/login')
    ├─ Check isAuthenticated
    ├─ If false → redirect to /login
    └─ If true → render component
```

## 🎯 Error Handling Flow

```
API Request
    ↓
Error occurs
    ↓
Response Interceptor catches error
    ↓
handleAxiosError(error)
    ├─ No response → Network Error
    ├─ 401 → Unauthorized (trigger refresh)
    ├─ 403 → Forbidden
    ├─ 404 → Not Found
    ├─ 422/400 → Validation Error
    ├─ 408 → Timeout (retry)
    ├─ 429 → Rate Limit (retry)
    ├─ 500/502/503/504 → Server Error (retry)
    └─ Other → Unknown Error
    ↓
Create ApiClientError
    ├─ message: User-friendly message
    ├─ statusCode: HTTP status
    ├─ code: ErrorCode enum
    └─ details: Additional info
    ↓
logError() (development only)
    ↓
Throw to component
    ↓
Component handles error
```

## 🔧 Configuration Layers

```
Environment Variables (.env.local)
    ↓
API_CONFIG (lib/api/config.ts)
    ├─ baseURL
    ├─ timeout
    ├─ retry settings
    ├─ auth endpoints
    └─ default headers
    ↓
API Client (lib/api/client.ts)
    ├─ Axios instance
    ├─ Interceptors
    └─ Request methods
    ↓
Services
    ├─ Auth Service
    ├─ Project Service
    └─ Other Services
    ↓
Components
```

## 📦 File Dependencies

```
lib/api/
├── index.ts (exports all)
│   ├── client.ts
│   │   ├── config.ts
│   │   ├── token-manager.ts
│   │   ├── error-handler.ts
│   │   └── types.ts
│   ├── auth.service.ts
│   │   ├── client.ts
│   │   ├── token-manager.ts
│   │   └── types.ts
│   ├── hooks.ts
│   │   ├── auth.service.ts
│   │   └── types.ts
│   ├── token-manager.ts
│   │   ├── config.ts
│   │   └── types.ts
│   ├── error-handler.ts
│   │   └── types.ts
│   ├── config.ts
│   └── types.ts
```

## 🚀 Usage Patterns

### Pattern 1: Direct API Call

```typescript
import { apiClient } from "@/lib/api";

const data = await apiClient.get("/endpoint");
```

### Pattern 2: Service Layer

```typescript
import { projectService } from "@/services/project.service";

const projects = await projectService.getProjects();
```

### Pattern 3: React Hook

```typescript
import { useProjects } from "@/services/project.service";

const { projects, isLoading, error } = useProjects();
```

### Pattern 4: Authentication

```typescript
import { useAuth } from "@/lib/api";

const { user, login, logout } = useAuth();
```

---

This architecture ensures:

- ✅ Separation of concerns
- ✅ Type safety throughout
- ✅ Automatic error handling
- ✅ Token management
- ✅ Request retry logic
- ✅ Centralized configuration
