# Quick Reference: Mock Data System

## 🎯 Quick Links

- **Mock Data**: `mock/projects.ts` - 10 project items
- **Types**: `types/project.ts` - TypeScript interfaces
- **Service**: `services/project.service.ts` - Data abstraction layer
- **Full Guide**: `MOCK_DATA_GUIDE.md` - Complete documentation

---

## ⚡ Quick Start (3 Steps)

### 1. Import the hook

```tsx
import { useProjects } from "@/services/project.service";
```

### 2. Use in your component

```tsx
const { projects, isLoading, error } = useProjects();
```

### 3. Pass to ProjectList

```tsx
<ProjectList
  projects={projects.map((p) => ({
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    tags: p.tags,
    onView: () => console.log(p.id),
  }))}
  isLoading={isLoading}
/>
```

---

## 🔄 Switch to Real API (1 Step!)

Edit `services/project.service.ts`:

```typescript
// Change this line:
const USE_MOCK_DATA = false; // 👈 That's it!
```

Then set your API URL in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**No UI changes needed!** ✅

---

## 📦 What's Included

### Mock Data (10 Projects)

Each project has:

- ✅ Unique ID
- ✅ Title & Description
- ✅ 3-5 Tags (varied tech stacks)
- ✅ View count (6k - 21k range)
- ✅ High-quality image URL (Unsplash)
- ✅ Timestamps (created/updated)

### Example Projects

1. E-Commerce Platform (React, Node.js, PostgreSQL)
2. AI Task Manager (TypeScript, Next.js, TensorFlow)
3. Collaboration Tool (Vue.js, WebRTC, Socket.io)
4. Fitness App (React Native, Firebase)
5. NFT Marketplace (Solidity, Web3.js, Ethereum)
6. Weather Dashboard (Angular, D3.js)
7. Social Analytics (Python, Django, AWS)
8. E-Learning Platform (Next.js, Prisma, tRPC)
9. Restaurant POS (Flutter, MySQL, Kubernetes)
10. Music Streaming (Swift, Kotlin, Microservices)

---

## 🛠️ Common Use Cases

### Basic Usage

```tsx
import { useProjects } from "@/services/project.service";
const { projects, isLoading } = useProjects();
```

### Server Component

```tsx
import { projectService } from "@/services/project.service";
const projects = await projectService.getProjects();
```

### Direct Mock (Quick Test)

```tsx
import { mockProjects } from "@/mock/projects";
// Use directly - no API layer
```

### Single Project

```tsx
const project = await projectService.getProjectById("1");
```

### Increment Views

```tsx
await projectService.incrementViews("1");
```

---

## 📊 Type Safety

```typescript
import { Project } from "@/types/project";

// All methods are typed
const projects: Project[] = await projectService.getProjects();
const project: Project | null = await projectService.getProjectById("1");
```

---

## 🎨 Examples Created

| File                            | Description                      |
| ------------------------------- | -------------------------------- |
| `app/projects-example/page.tsx` | Full-featured with service layer |
| `app/simple-projects/page.tsx`  | Direct mock usage + filtering    |

Visit these routes to see the examples in action:

- `/projects-example` - Recommended approach
- `/simple-projects` - Simple approach with filters

---

## 🔍 Architecture

```
Component (ProjectList)
    ↓
Hook (useProjects) or Service (projectService)
    ↓
Interface (IProjectService)
    ↓
├─ MockProjectService ← YOU ARE HERE
└─ ApiProjectService  ← Switch to this when ready
```

---

## ✅ Benefits

1. **Zero UI Changes** when switching APIs
2. **Type Safety** everywhere
3. **Easy Testing** with mock service
4. **Realistic Data** for development
5. **Production Ready** architecture

---

## 📝 Next Steps

1. ✅ Use mock data in development
2. ✅ Build your UI components
3. ✅ Test with realistic data
4. ✅ When backend is ready: flip ONE flag
5. ✅ Deploy to production

---

## 🆘 Need Help?

- **Full Guide**: `MOCK_DATA_GUIDE.md`
- **TypeScript Errors**: Check `tsconfig.json` paths
- **Images Not Loading**: Configure `next.config.js`
- **API Not Working**: Check `.env.local` and console

---

## 🚀 Example Component Template

```tsx
"use client";

import { ProjectList } from "@/components/ProjectList";
import { useProjects } from "@/services/project.service";

export default function MyPage() {
  const { projects, isLoading, error } = useProjects();

  if (error) return <div>Error: {error.message}</div>;

  return (
    <ProjectList
      projects={projects.map((p) => ({
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        tags: p.tags,
        onView: () => alert(`Viewing: ${p.title}`),
      }))}
      isLoading={isLoading}
    />
  );
}
```

**Copy, paste, customize!** 🎉
