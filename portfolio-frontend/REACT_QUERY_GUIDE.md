# React Query Implementation Guide

## 📦 Installation

React Query (TanStack Query) has been installed with devtools:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## 🎯 Implementation Overview

This implementation provides a complete React Query setup for your portfolio application with:

1. ✅ **React Query Provider** - Global query client configuration
2. ✅ **Project Queries & Mutations** - Complete CRUD operations
3. ✅ **Optimistic View Count** - Instant UI updates with rollback
4. ✅ **Real API Integration** - All components connected to backend
5. ✅ **Auth Middleware** - Route protection and security headers

---

## 1️⃣ React Query Provider

### Location: `/lib/query/provider.tsx`

**Features:**

- Server/Client query client management
- Optimized caching (5min stale, 10min GC)
- Smart retry logic (no retry on 4xx errors)
- React Query Devtools (dev mode only)

**Usage:**
Already wrapped in `app/layout.tsx`:

```tsx
import { QueryProvider } from "@/lib/query";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

---

## 2️⃣ Project Queries & Mutations

### Location: `/lib/query/projects.ts`

### Query Hooks

#### `useProjects()` - Fetch All Projects

```tsx
import { useProjects } from "@/lib/query";

function MyComponent() {
  const { data: projects, isLoading, error, refetch } = useProjects();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}
```

#### `useProject(id)` - Fetch Single Project

```tsx
const { data: project, isLoading } = useProject("project-id");
```

### Mutation Hooks

#### `useCreateProject()` - Create New Project

```tsx
const createProject = useCreateProject();

const handleCreate = async () => {
  try {
    await createProject.mutateAsync({
      title: "New Project",
      description: "Description",
      tags: ["react", "typescript"],
      views: 0,
    });
  } catch (error) {
    console.error("Failed:", error);
  }
};
```

#### `useUpdateProject()` - Update Project

```tsx
const updateProject = useUpdateProject();

await updateProject.mutateAsync({
  id: "project-id",
  data: { title: "Updated Title" },
});
```

**Features:**

- ✅ Optimistic updates
- ✅ Automatic rollback on error
- ✅ Cache invalidation

#### `useDeleteProject()` - Delete Project

```tsx
const deleteProject = useDeleteProject();

await deleteProject.mutateAsync("project-id");
```

**Features:**

- ✅ Optimistic removal from list
- ✅ Rollback on error
- ✅ Complete cache cleanup

---

## 3️⃣ Optimistic View Count

### High-Level Hook: `useProjectView(projectId)`

**Simplified interface for components:**

```tsx
import { useProjectView } from "@/lib/query";

function ProjectCard({ project }) {
  const { viewCount, incrementView, isIncrementing } = useProjectView(
    project.id
  );

  return (
    <div onClick={() => incrementView("optimistic")}>
      <h3>{project.title}</h3>
      <span>
        👁️ {viewCount} {isIncrementing && "..."}
      </span>
    </div>
  );
}
```

### Low-Level Hook: `useIncrementViews(projectId)`

**Advanced control for complex scenarios:**

```tsx
const incrementViews = useIncrementViews("project-id");

// Optimistic mode (instant UI update)
incrementViews.mutate("optimistic");

// Consistent mode (wait for server)
incrementViews.mutate("consistent");
```

**How it works:**

1. User clicks → **View count +1 immediately** (optimistic)
2. API call in background → Update cache with real value
3. If API fails → **Rollback to original value**

---

## 4️⃣ UI Components with Real API

### ProjectsList Component

**Location:** `/components/ProjectsList.tsx`

**Features:**

- ✅ Loading states
- ✅ Error handling with retry
- ✅ Optimistic view counting
- ✅ Real-time updates
- ✅ Responsive design

**Usage:**

```tsx
import { ProjectsList } from "@/components/ProjectsList";

<ProjectsList />;
```

### Full Demo Page

**Location:** `/app/projects/page.tsx`

**Features:**

- ✅ Complete CRUD operations
- ✅ Create project form
- ✅ Update/Delete actions
- ✅ Multiple view modes
- ✅ Premium UI design

**Access:** Navigate to `/projects` in your app

---

## 5️⃣ Auth Middleware

### Location: `/middleware.ts`

**Features:**

#### 🔒 Route Protection

- Protected routes: `/dashboard`, `/admin`, `/projects/create`, `/projects/edit`
- Auth routes: `/login`, `/register`
- Public routes: `/`, `/projects`, `/health`

#### 🔐 Authentication Flow

```
Unauthenticated → /dashboard → Redirect to /login?redirect=/dashboard
Authenticated → /login → Redirect to / (or ?redirect param)
```

#### 🛡️ Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restricted

#### 🌐 CORS Configuration

- Automatic CORS headers for `/api` routes
- Supports credentials
- Pre-configured methods and headers

**Customizing Protected Routes:**

```typescript
// middleware.ts
const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/my-custom-route", // Add your route
];
```

---

## 🎨 Cache Management

### Query Keys Structure

Centralized in `projectKeys`:

```typescript
projectKeys.all; // ['projects']
projectKeys.lists(); // ['projects', 'list']
projectKeys.list({ status: "active" }); // ['projects', 'list', { status: 'active' }]
projectKeys.details(); // ['projects', 'detail']
projectKeys.detail("id-123"); // ['projects', 'detail', 'id-123']
```

### Manual Cache Operations

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { projectKeys } from "@/lib/query";

const queryClient = useQueryClient();

// Invalidate all projects
queryClient.invalidateQueries({ queryKey: projectKeys.all });

// Invalidate specific project
queryClient.invalidateQueries({ queryKey: projectKeys.detail("id") });

// Set cache data
queryClient.setQueryData(projectKeys.lists(), newProjects);

// Get cache data
const cached = queryClient.getQueryData(projectKeys.lists());

// Remove from cache
queryClient.removeQueries({ queryKey: projectKeys.detail("id") });
```

---

## 🔧 Configuration

### Query Client Defaults

Located in `/lib/query/provider.tsx`:

```typescript
{
  queries: {
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes (formerly cacheTime)
    retry: 2,                   // Retry failed requests
  },
  mutations: {
    retry: 1,
  }
}
```

### Per-Query Overrides

```tsx
useProjects({
  staleTime: 10 * 60 * 1000, // 10 minutes
  refetchInterval: 30000, // Refetch every 30s
  enabled: false, // Disable auto-fetch
});
```

---

## 🐛 Debugging

### React Query Devtools

**When:** Development mode only  
**Where:** Bottom-left corner of screen

**Features:**

- View all queries and their states
- Inspect cache data
- Manually trigger refetch
- See query timelines

### Console Logging

All mutations log on success/error:

```tsx
useCreateProject({
  onSuccess: (data) => console.log("Created:", data),
  onError: (error) => console.error("Failed:", error),
});
```

---

## 📊 Performance Benefits

### Before (useState/useEffect)

- ❌ Manual loading states
- ❌ Manual error handling
- ❌ No caching
- ❌ Duplicate requests
- ❌ Stale data

### After (React Query)

- ✅ Automatic loading states
- ✅ Built-in error handling
- ✅ Smart caching (5-10min)
- ✅ Request deduplication
- ✅ Background refetching
- ✅ Optimistic updates
- ✅ Automatic retries

---

## 🚀 Next Steps

1. **Test the implementation:**

   ```bash
   npm run dev
   # Visit http://localhost:3001/projects
   ```

2. **Verify backend is running:**

   ```bash
   docker compose up backend postgres
   ```

3. **Test protected routes:**

   - Try accessing `/dashboard` without login
   - Should redirect to `/login?redirect=/dashboard`

4. **Check React Query Devtools:**

   - Open app in development mode
   - Look for devtools panel in bottom-left

5. **Test optimistic updates:**
   - Click a project card to increment views
   - Notice instant UI update
   - Check network tab for background request

---

## 📝 Migration from Old Hooks

### Before (project.service.ts)

```tsx
import { useProjects } from "@/services/project.service";

const { projects, isLoading, error, refetch } = useProjects();
```

### After (React Query)

```tsx
import { useProjects } from "@/lib/query";

const { data: projects, isLoading, error, refetch } = useProjects();
```

**Changes:**

- `projects` → `data: projects` (destructure with alias)
- Same interface otherwise!

---

## 🎯 Summary

✅ **Provider Setup:** QueryProvider in root layout  
✅ **Queries:** useProjects, useProject  
✅ **Mutations:** useCreateProject, useUpdateProject, useDeleteProject  
✅ **Optimistic:** useProjectView with instant updates  
✅ **UI Components:** ProjectsList with real API  
✅ **Middleware:** Auth protection + security headers

**Everything is production-ready and connected to your real backend API!**

---

## 📚 Additional Resources

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
