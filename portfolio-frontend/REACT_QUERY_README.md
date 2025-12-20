# 🚀 React Query Implementation - Quick Start

## ✅ Implementation Complete

All 5 tasks have been successfully implemented:

1. ✅ **React Query Provider** - Configured and wrapped in root layout
2. ✅ **Project Queries + Mutations** - Full CRUD with optimistic updates
3. ✅ **Optimistic View Count** - Instant UI feedback with rollback
4. ✅ **UI with Real API** - Demo components and pages
5. ✅ **Middleware Auth** - Route protection and security headers

---

## 🏃 Quick Start Guide

### 1. Start the Backend

```bash
cd d:\Project\portfolio
docker compose up backend postgres redis
```

### 2. Start the Frontend

```bash
cd d:\Project\portfolio\portfolio-frontend
npm run dev
```

### 3. Visit Demo Pages

#### Projects Page (Public)

```
http://localhost:3001/projects
```

**Features:**

- View all projects from API
- Click to increment views (optimistic)
- Create new projects
- Update/delete projects
- Error handling with retry

#### Login Page

```
http://localhost:3001/login
```

**Demo Credentials:**

- Email: `admin@example.com`
- Password: `Admin123!@#`

#### Dashboard (Protected)

```
http://localhost:3001/dashboard
```

**Note:** Requires login. Will redirect to `/login` if not authenticated.

---

## 📦 What's Included

### Core Hooks

```tsx
import {
  // Queries
  useProjects, // Fetch all projects
  useProject, // Fetch single project

  // Mutations
  useCreateProject, // Create with optimistic update
  useUpdateProject, // Update with rollback
  useDeleteProject, // Delete with optimistic removal

  // View Count
  useIncrementViews, // Low-level view increment
  useProjectView, // High-level view management
} from "@/lib/query";
```

### Components

```tsx
import { ProjectsList } from "@/components/ProjectsList";
```

Displays projects with:

- Loading states
- Error handling
- Optimistic view counting
- Responsive design

### Auth Utilities

```tsx
import { useAuthState } from "@/lib/auth-utils";

const { isAuthenticated, isLoading, token } = useAuthState();
```

---

## 💡 Usage Examples

### Simple List

```tsx
"use client";

import { useProjects } from "@/lib/query";

export default function MyPage() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects?.map((p) => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  );
}
```

### Create Project

```tsx
"use client";

import { useCreateProject } from "@/lib/query";

export default function CreateForm() {
  const createProject = useCreateProject();

  const handleSubmit = async (data) => {
    await createProject.mutateAsync({
      title: data.title,
      description: data.description,
      tags: ["demo"],
      views: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createProject.isPending}>
        {createProject.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Optimistic View Count

```tsx
"use client";

import { useProjectView } from "@/lib/query";

export default function ProjectCard({ project }) {
  const { viewCount, incrementView, isIncrementing } = useProjectView(
    project.id
  );

  return (
    <div onClick={() => incrementView()}>
      <h3>{project.title}</h3>
      <span>
        👁️ {viewCount} {isIncrementing && "..."}
      </span>
    </div>
  );
}
```

---

## 🔒 Protected Routes

### Configured in `middleware.ts`

**Protected (require auth):**

- `/dashboard`
- `/admin`
- `/projects/create`
- `/projects/edit`

**Public:**

- `/` (home)
- `/projects`
- `/login`
- `/register`

**Behavior:**

- Unauthenticated → `/dashboard` → Redirect to `/login?redirect=/dashboard`
- Authenticated → `/login` → Redirect to home

---

## 🐛 React Query Devtools

**Access:** Bottom-left corner in development mode

**Features:**

- View all queries and cache
- Inspect query states
- Manual refetch
- See request timelines

---

## 📚 Full Documentation

### Comprehensive Guides

- **`REACT_QUERY_GUIDE.md`** - Complete API reference and examples
- **`REACT_QUERY_QUICK_START.md`** - Quick reference and patterns
- **`IMPLEMENTATION_CHECKLIST.md`** - Testing procedures
- **`REACT_QUERY_SUMMARY.md`** - Visual overview

### Architecture Docs

- **`API_CLIENT_ARCHITECTURE.md`** - API client design
- **`API_CLIENT_GUIDE.md`** - API usage guide

---

## ✅ Build Status

**TypeScript:** ✅ Passing  
**Build:** ✅ Successful  
**Production:** ✅ Ready

```bash
# Verify
npm run typecheck  # ✅ No errors
npm run build      # ✅ Build successful
```

---

## 🎯 Next Steps

### 1. Test Everything

```bash
npm run dev
```

Visit each demo page:

- [ ] `/projects` - Test CRUD operations
- [ ] `/login` - Test auth flow
- [ ] `/dashboard` - Test protected route

### 2. Customize for Your Needs

#### Add Custom Hooks

Create new hooks in `lib/query/`:

```tsx
// lib/query/comments.ts
export function useComments(projectId: string) {
  return useQuery({
    queryKey: ["comments", projectId],
    queryFn: () => api.getComments(projectId),
  });
}
```

#### Add Protected Routes

Edit `middleware.ts`:

```tsx
const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/my-new-route", // Add here
];
```

### 3. Deploy to Production

1. **Set Environment Variable:**

   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

2. **Build:**

   ```bash
   npm run build
   ```

3. **Deploy:**
   - Vercel: `vercel deploy`
   - Docker: Use provided Dockerfile
   - Other: Follow platform docs

---

## 🆘 Troubleshooting

### Backend Connection Error

**Problem:** `Failed to fetch`  
**Solution:**

```bash
# Ensure backend is running
docker compose up backend postgres redis
```

### Protected Route Not Working

**Problem:** Can access `/dashboard` without login  
**Solution:**

- Check `middleware.ts` is in root directory
- Check cookies are being set on login
- Clear browser cookies and try again

### Query Not Updating

**Problem:** Data doesn't update after mutation  
**Solution:**

- Check query invalidation in mutation hooks
- Use React Query Devtools to inspect cache
- Verify query keys match between query and invalidation

---

## 📊 Performance

### Caching Strategy

- **Stale Time:** 5 minutes
- **Cache Time:** 10 minutes
- **Refetch:** On window focus (production only)
- **Retry:** Up to 2 times (not on 4xx)

### Optimizations

- ✅ Request deduplication
- ✅ Background refetch
- ✅ Optimistic updates
- ✅ Automatic garbage collection

---

## 🎉 Summary

**All 5 Tasks Complete:**

1. ✅ React Query Provider
2. ✅ Project Queries + Mutations
3. ✅ Optimistic View Count
4. ✅ UI with Real API
5. ✅ Middleware Auth

**Production Ready:**

- Type-safe
- Error handling
- Loading states
- Security headers
- Route protection
- Optimized caching

**Start Building:** All hooks and components are ready to use!

---

## 📞 Support

- **Documentation:** See `REACT_QUERY_GUIDE.md`
- **Examples:** See `REACT_QUERY_QUICK_START.md`
- **Testing:** See `IMPLEMENTATION_CHECKLIST.md`
- **Overview:** See `REACT_QUERY_SUMMARY.md`

---

**Ready to go! 🚀**

```bash
npm run dev
```

Visit: `http://localhost:3001/projects`
