# Mock Data Integration Guide

This guide explains how to use the mock data system and switch between mock and real API.

---

## 📁 File Structure

```
portfolio-frontend/
├── types/
│   └── project.ts              # TypeScript interfaces for type safety
├── mock/
│   └── projects.ts             # Mock data with 10 projects
├── services/
│   └── project.service.ts      # Service layer abstraction
└── components/
    └── ProjectList.tsx         # UI component (data-source agnostic)
```

---

## 🚀 Quick Start: Using Mock Data in ProjectList

### Option 1: Using the React Hook (Recommended)

```tsx
"use client";

import { ProjectList } from "@/components/ProjectList";
import { useProjects } from "@/services/project.service";

export default function ProjectsPage() {
  const { projects, isLoading, error } = useProjects();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <ProjectList
      projects={projects.map((project) => ({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        tags: project.tags,
        onView: () => console.log(`Viewing project: ${project.id}`),
      }))}
      isLoading={isLoading}
    />
  );
}
```

### Option 2: Server Component (Next.js 13+)

```tsx
import { ProjectList } from "@/components/ProjectList";
import { projectService } from "@/services/project.service";

export default async function ProjectsPage() {
  const projects = await projectService.getProjects();

  return (
    <ProjectList
      projects={projects.map((project) => ({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        tags: project.tags,
        onView: () => {}, // Handle this with a client component wrapper
      }))}
    />
  );
}
```

### Option 3: Direct Mock Import (Quick Testing)

```tsx
"use client";

import { useState, useEffect } from "react";
import { ProjectList } from "@/components/ProjectList";
import { mockProjects } from "@/mock/projects";

export default function ProjectsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ProjectList
      projects={mockProjects.map((project) => ({
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        tags: project.tags,
        onView: () => alert(`Viewing ${project.title}`),
      }))}
      isLoading={isLoading}
    />
  );
}
```

---

## 🔄 Switching from Mock to Real API

### Step 1: Update Configuration

In `services/project.service.ts`, change the flag:

```typescript
// Before (using mock data)
const USE_MOCK_DATA = true;

// After (using real API)
const USE_MOCK_DATA = false;
```

### Step 2: Set API URL

Create or update `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# or for production
NEXT_PUBLIC_API_URL=https://api.yourportfolio.com
```

### Step 3: That's It! 🎉

**No changes needed in your UI components!** The `ProjectList` component remains exactly the same.

---

## 🎯 Architecture Benefits

### ✅ Separation of Concerns

- **UI Components** don't know where data comes from
- **Service Layer** handles data fetching logic
- **Mock Data** lives in its own module

### ✅ Type Safety

```typescript
// All data structures are typed
import { Project } from "@/types/project";

// TypeScript catches mismatches
const project: Project = {
  id: "1",
  title: "My Project",
  // ... TypeScript ensures all required fields are present
};
```

### ✅ Easy Testing

```typescript
// Mock service is perfect for unit tests
import { MockProjectService } from "@/services/project.service";

test("renders project list", async () => {
  const service = new MockProjectService();
  const projects = await service.getProjects();
  expect(projects).toHaveLength(10);
});
```

### ✅ Gradual Migration

You can switch specific features one at a time:

```typescript
// Use mock for some features
const USE_MOCK_PROJECTS = true;
const USE_MOCK_COMMENTS = false;

// Perfect for incremental API development
```

---

## 📊 Mock Data Details

The mock data includes **10 diverse projects** with:

| Field         | Example                                            |
| ------------- | -------------------------------------------------- |
| `id`          | `"1"` (string)                                     |
| `title`       | `"E-Commerce Platform"`                            |
| `description` | `"A full-stack e-commerce solution..."` (detailed) |
| `tags`        | `["React", "Node.js", "PostgreSQL"]` (3-5 tags)    |
| `views`       | `12453` (realistic range: 6k-21k)                  |
| `imageUrl`    | High-quality Unsplash images (800x600)             |
| `createdAt`   | ISO 8601 format                                    |
| `updatedAt`   | ISO 8601 format                                    |

### Technology Stacks Represented:

- Frontend: React, Next.js, Vue.js, Angular, React Native, Flutter
- Backend: Node.js, Python, Django, Express, Microservices
- Databases: PostgreSQL, MongoDB, MySQL, Firebase, Elasticsearch
- Special: Blockchain/Web3, AI/ML, Real-time features

---

## 🛠️ Advanced Usage

### Incrementing Project Views

```tsx
import { projectService } from "@/services/project.service";

function ProjectCard({ id, title }) {
  const handleView = async () => {
    // This works with both mock and real API
    await projectService.incrementViews(id);
    console.log("Views incremented!");
  };

  return <button onClick={handleView}>View {title}</button>;
}
```

### Fetching Single Project

```tsx
import { projectService } from "@/services/project.service";

async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await projectService.getProjectById(params.id);

  if (!project) {
    return <div>Project not found</div>;
  }

  return <div>{project.title}</div>;
}
```

### Custom Hook with Filtering

```tsx
import { useProjects } from "@/services/project.service";

function useFilteredProjects(searchTerm: string) {
  const { projects, isLoading, error } = useProjects();

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return { projects: filtered, isLoading, error };
}
```

---

## 🔍 Troubleshooting

### Images not loading?

The mock data uses Unsplash URLs. Ensure your Next.js config allows external images:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ["images.unsplash.com"],
  },
};
```

### TypeScript errors?

Make sure `tsconfig.json` has path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### API not working after switching?

1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify backend is running
3. Check browser console for CORS errors
4. Ensure API endpoints match the service expectations

---

## 📝 Best Practices

### ✅ DO:

- Keep mock data realistic and up-to-date
- Use the service layer for all data access
- Add error handling in components
- Type all data structures

### ❌ DON'T:

- Import mock data directly in UI components
- Hard-code API URLs in components
- Skip error handling
- Mix data fetching logic with UI logic

---

## 🎨 Customization

### Adding New Mock Projects

Edit `mock/projects.ts`:

```typescript
export const mockProjects: Project[] = [
  // ... existing projects
  {
    id: "11",
    title: "Your New Project",
    description: "Amazing description...",
    tags: ["Tag1", "Tag2", "Tag3"],
    views: 1000,
    imageUrl: "https://images.unsplash.com/photo-xxx",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

### Adding New Service Methods

Edit `services/project.service.ts`:

```typescript
export interface IProjectService {
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
  incrementViews(id: string): Promise<void>;
  // Add your new method
  searchProjects(query: string): Promise<Project[]>;
}

// Implement in both MockProjectService and ApiProjectService
```

---

## 🚢 Ready for Production

When your backend is ready:

1. Set `USE_MOCK_DATA = false`
2. Update `NEXT_PUBLIC_API_URL`
3. Deploy!

The UI components won't change at all. That's the power of clean architecture! 🎉
