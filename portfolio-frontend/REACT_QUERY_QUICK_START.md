# 🚀 React Query Implementation - Quick Reference

## ✅ What's Implemented

### 1️⃣ React Query Provider

- **File:** `lib/query/provider.tsx`
- **Location:** Already wrapped in `app/layout.tsx`
- **Features:** Optimized caching, retry logic, devtools

### 2️⃣ Project Queries + Mutations

- **File:** `lib/query/projects.ts`, `lib/query/index.ts`
- **Hooks Available:**
  - `useProjects()` - Fetch all projects
  - `useProject(id)` - Fetch single project
  - `useCreateProject()` - Create project with optimistic update
  - `useUpdateProject()` - Update with rollback on error
  - `useDeleteProject()` - Delete with optimistic removal
  - `useIncrementViews(id)` - Low-level view increment
  - `useProjectView(id)` - High-level view management

### 3️⃣ Optimistic View Count

- **Feature:** Instant UI updates, background sync, auto-rollback
- **Hook:** `useProjectView(projectId)`
- **Demo:** See `components/ProjectsList.tsx`

### 4️⃣ UI with Real API

- **Components:**
  - `components/ProjectsList.tsx` - List with optimistic views
  - `app/projects/page.tsx` - Full CRUD demo page
- **Access:** `/projects` route

### 5️⃣ Middleware Auth

- **File:** `middleware.ts` (root level)
- **Features:**
  - Route protection (dashboard, admin, etc.)
  - Auto-redirect unauthenticated users
  - Security headers
  - CORS for API routes

---

## 📦 Quick Start

### 1. Check TypeScript (✅ Already passed)

```bash
npm run typecheck
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Visit the Demo Page

```
http://localhost:3001/projects
```

### 4. Test Features

- ✅ View projects list with loading state
- ✅ Click projects to increment views (optimistic)
- ✅ Create new project
- ✅ Update/Delete projects
- ✅ Try accessing `/dashboard` (should redirect to login)

---

## 🔥 Code Examples

### Using in Your Components

```tsx
// Import hooks
import { useProjects, useProjectView } from "@/lib/query";

// Fetch projects
function MyComponent() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// Optimistic view counting
function ProjectCard({ project }) {
  const { viewCount, incrementView, isIncrementing } = useProjectView(
    project.id
  );

  return (
    <div onClick={() => incrementView()}>
      <h3>{project.title}</h3>
      <span>👁️ {viewCount}</span>
    </div>
  );
}

// Create project
function CreateForm() {
  const createProject = useCreateProject();

  const handleSubmit = async (data) => {
    await createProject.mutateAsync({
      title: data.title,
      description: data.description,
      tags: data.tags,
      views: 0,
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎨 React Query Devtools

**Location:** Bottom-left corner in development mode  
**Toggle:** Click the React Query icon  
**Features:**

- View all queries and cache
- Inspect query states
- Manual refetch
- See request timelines

---

## 🔒 Protected Routes

**Configured in:** `middleware.ts`

### Protected (need auth):

- `/dashboard`
- `/admin`
- `/projects/create`
- `/projects/edit`

### Public (no auth):

- `/`
- `/projects`
- `/login`
- `/register`
- `/health`

**Behavior:**

- Unauthenticated → protected route → redirect to `/login?redirect=<route>`
- Authenticated → auth route → redirect to home or redirect param

---

## 📁 File Structure

```
portfolio-frontend/
├── lib/
│   └── query/
│       ├── index.ts          # Exports all hooks
│       ├── provider.tsx      # Query client provider
│       └── projects.ts       # All project hooks
├── components/
│   └── ProjectsList.tsx      # Demo component
├── app/
│   ├── layout.tsx            # QueryProvider wrapped here
│   └── projects/
│       └── page.tsx          # Full CRUD demo
├── middleware.ts             # Auth + security
└── REACT_QUERY_GUIDE.md      # Detailed docs
```

---

## 🐛 Troubleshooting

### Issue: "Query client not found"

**Fix:** Make sure `QueryProvider` is in `app/layout.tsx` (✅ already done)

### Issue: TypeScript errors

**Fix:** Run `npm run typecheck` (✅ already passing)

### Issue: Backend connection error

**Fix:** Ensure backend is running:

```bash
cd d:\Project\portfolio
docker compose up backend postgres
```

### Issue: Can't see devtools

**Fix:** Only visible in development mode (`npm run dev`)

---

## 📊 Performance Metrics

### Caching Strategy:

- **Stale Time:** 5 minutes (data considered fresh)
- **GC Time:** 10 minutes (cache cleanup)
- **Retry:** Up to 2 times for 5xx errors
- **No Retry:** On 4xx client errors

### Benefits:

- ⚡ Instant UI updates (optimistic)
- 🔄 Automatic background refetch
- 💾 Smart caching (reduced API calls)
- 🛡️ Built-in error handling
- 🎯 Request deduplication

---

## ✨ Next Steps

1. **Test the demo page:** Visit `/projects`
2. **Check devtools:** Look for React Query panel
3. **Try protected routes:** Visit `/dashboard`
4. **Integrate into your own pages:** Import hooks from `@/lib/query`
5. **Customize:** Modify `middleware.ts` for your routes

---

## 📚 Full Documentation

See `REACT_QUERY_GUIDE.md` for:

- Detailed API reference
- Migration guide
- Advanced patterns
- Cache management
- Error handling

---

## 🎯 Summary

**All 5 tasks complete:**

1. ✅ React Query Provider (in root layout)
2. ✅ Project queries + mutations (all CRUD)
3. ✅ Optimistic view count (instant updates)
4. ✅ UI with real API (demo components)
5. ✅ Middleware auth (route protection)

**Ready to use in production!** 🚀
