# Mock Data Directory

This directory contains mock data for the portfolio application.

## 📁 Contents

- **`projects.ts`** - 10 realistic portfolio project items

## 🎯 Purpose

Mock data serves several important purposes:

1. **Independent Development** - Build UI without waiting for backend
2. **Consistent Testing** - Deterministic data for reliable tests
3. **Rapid Prototyping** - Quickly validate designs and flows
4. **Offline Development** - Work without network/server dependencies
5. **Demo/Presentation** - Professional-looking data for showcases

## 📊 Data Structure

Each project in `projects.ts` contains:

```typescript
{
  id: string;              // Unique identifier
  title: string;           // Project name
  description: string;     // Detailed description (1-2 sentences)
  tags: string[];          // 3-5 technology tags
  views: number;           // View count (6,000 - 21,000 range)
  imageUrl: string;        // High-quality Unsplash image
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

## 🎨 Data Quality

The mock data represents **realistic, production-quality** portfolio items:

- **Diverse Technologies**: Frontend, backend, mobile, blockchain, AI/ML
- **Professional Images**: High-resolution images from Unsplash (800x600)
- **Realistic Descriptions**: Detailed, compelling project descriptions
- **Varied Metrics**: View counts ranging from 6,723 to 21,045
- **Proper Timestamps**: Realistic creation and update dates

## 🚀 Usage

### Direct Import (Quick Testing)

```typescript
import { mockProjects } from "@/mock/projects";

// Use directly
console.log(mockProjects); // Array of 10 projects
```

### Via Service Layer (Recommended)

```typescript
import { projectService } from "@/services/project.service";

// Service automatically uses mock when USE_MOCK_DATA = true
const projects = await projectService.getProjects();
```

## 🔄 Switching to Real Data

When you're ready to use real API data:

1. **No changes needed here** - Mock data stays as-is
2. Update `services/project.service.ts`: Set `USE_MOCK_DATA = false`
3. Configure API URL in `.env.local`

The beauty of the architecture is that this mock data directory becomes a **fallback** or **testing resource** even after you switch to real API.

## ✏️ Customization

### Adding New Projects

Simply append to the `mockProjects` array:

```typescript
export const mockProjects: Project[] = [
  // ... existing projects
  {
    id: "11",
    title: "Your New Project",
    description: "Amazing features...",
    tags: ["React", "TypeScript", "Tailwind"],
    views: 15000,
    imageUrl: "https://images.unsplash.com/photo-...",
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-08T18:00:00Z",
  },
];
```

### Finding Great Images

Use [Unsplash](https://unsplash.com/):

1. Search for relevant term (e.g., "technology", "coding", "design")
2. Click on an image
3. Copy URL and append: `?w=800&h=600&fit=crop`
4. Use as `imageUrl`

Example:

```
https://images.unsplash.com/photo-1234567890?w=800&h=600&fit=crop
```

### Generating Realistic View Counts

Use a range of 5,000 - 25,000 for realism:

```typescript
// Random between 5000 and 25000
const views = Math.floor(Math.random() * 20000) + 5000;
```

## 📚 Related Files

- **Types**: `../types/project.ts` - TypeScript interfaces
- **Service**: `../services/project.service.ts` - Data access layer
- **Components**: `../components/ProjectList.tsx` - UI consumer
- **Examples**: `../app/projects-example/page.tsx` - Usage examples

## 🧪 Testing

Mock data is perfect for tests:

```typescript
import { mockProjects } from "@/mock/projects";

test("renders all projects", () => {
  expect(mockProjects).toHaveLength(10);
});

test("all projects have required fields", () => {
  mockProjects.forEach((project) => {
    expect(project.id).toBeDefined();
    expect(project.title).toBeDefined();
    expect(project.tags.length).toBeGreaterThanOrEqual(3);
  });
});
```

## 📈 Statistics

Current mock data set:

- **Total Projects**: 10
- **Total Views**: 126,789
- **Unique Technologies**: 45+
- **Tag Range**: 3-5 tags per project
- **Average Description Length**: ~150 characters

## 🎯 Best Practices

### ✅ DO:

- Keep data realistic and professional
- Update timestamps to recent dates
- Use high-quality images
- Maintain consistent data structure
- Add variety in tech stacks

### ❌ DON'T:

- Use placeholder text like "Lorem ipsum"
- Use broken image URLs
- Create unrealistic view counts (e.g., 1 million)
- Skip required fields
- Use mock data directly in production

## 🔒 Production Note

**Important**: Mock data should **never** be deployed to production as the primary data source. Always switch to real API before deploying.

However, keeping mock data in your codebase is valuable for:

- Development environments
- Automated testing
- Storybook/component demos
- Fallback during API outages (optional)

---

**Need help?** Check the main documentation:

- `../MOCK_DATA_GUIDE.md` - Complete guide
- `../QUICK_REFERENCE.md` - Quick cheat sheet
- `../SUMMARY.md` - Project summary
