# Project Components Documentation

Professional Next.js components for displaying project portfolios with modern UI/UX design.

## 📦 Components

### ProjectCard

A responsive, animated card component for displaying individual projects.

#### Props

| Prop          | Type              | Required | Description                             |
| ------------- | ----------------- | -------- | --------------------------------------- |
| `title`       | `string`          | ✅       | Project title                           |
| `description` | `string`          | ✅       | Project description                     |
| `imageUrl`    | `string`          | ✅       | URL to project image                    |
| `tags`        | `string[]`        | ✅       | Array of technology tags                |
| `onView`      | `() => void`      | ✅       | Callback when "View Project" is clicked |
| `imageSlot`   | `React.ReactNode` | ❌       | Custom image component (optional)       |

#### Features

- ✨ **Hover animations** - Smooth scale and shadow effects
- 🎨 **Gradient overlay** - Beautiful gradient on images
- 📱 **Fully responsive** - Mobile-first design (320px → 1920px+)
- ♿ **Accessible** - ARIA labels and keyboard navigation
- 🌗 **Dark mode** - Automatic dark mode support
- 🏷️ **Tag system** - Colorful gradient tags for technologies
- 🖼️ **Image slot** - Replace image with custom component

#### Example Usage

```tsx
import { ProjectCard } from "@/components";

<ProjectCard
  title="My Awesome Project"
  description="A full-stack application built with Next.js and TypeScript"
  imageUrl="https://example.com/image.jpg"
  tags={["Next.js", "TypeScript", "Tailwind CSS"]}
  onView={() => console.log("View clicked")}
/>;
```

#### Custom Image Slot

```tsx
<ProjectCard
  title="Custom Image Project"
  description="Using a custom image component"
  imageUrl="" // Still required but won't be used
  tags={["React", "Next.js"]}
  onView={() => {}}
  imageSlot={
    <video autoPlay loop muted className="h-full w-full object-cover">
      <source src="/video.mp4" type="video/mp4" />
    </video>
  }
/>
```

---

### SkeletonCard

Loading skeleton component that matches ProjectCard structure.

#### Features

- 💫 **Pulsing animation** - Smooth gradient pulse effect
- 🎯 **Accurate layout** - Matches ProjectCard dimensions
- 🌗 **Dark mode support** - Adapts to theme

#### Example Usage

```tsx
import { SkeletonCard } from "@/components";

<SkeletonCard />;
```

---

### ProjectList

Grid layout component for displaying multiple projects.

#### Props

| Prop            | Type                                    | Required | Default                | Description                 |
| --------------- | --------------------------------------- | -------- | ---------------------- | --------------------------- |
| `projects`      | `Omit<ProjectCardProps, 'imageSlot'>[]` | ✅       | -                      | Array of project data       |
| `isLoading`     | `boolean`                               | ❌       | `false`                | Show loading skeletons      |
| `skeletonCount` | `number`                                | ❌       | `6`                    | Number of skeletons to show |
| `emptyMessage`  | `string`                                | ❌       | `'No projects found.'` | Message when no projects    |

#### Features

- 📐 **Responsive grid** - 1 column → 2 columns → 3 columns
- ⏳ **Loading state** - Shows skeleton cards while loading
- 📭 **Empty state** - Beautiful empty state with custom message
- 🎯 **Auto-layout** - Proper spacing and alignment

#### Example Usage

```tsx
import { ProjectList } from '@/components';

const projects = [
  {
    title: 'Project 1',
    description: 'Description here',
    imageUrl: 'https://example.com/1.jpg',
    tags: ['React', 'TypeScript'],
    onView: () => console.log('View 1'),
  },
  // ... more projects
];

// Basic usage
<ProjectList projects={projects} />

// With loading state
<ProjectList projects={projects} isLoading={true} skeletonCount={6} />

// With empty state
<ProjectList projects={[]} emptyMessage="No projects available" />
```

---

## 🎨 Design Features

### Color Palette

- **Primary Gradient**: Indigo (600) → Purple (600)
- **Tag Gradient**: Blue (500) → Purple (600)
- **Dark Mode**: Automatic support with Tailwind dark: variants

### Responsive Breakpoints

- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

### Animations

- **Hover Scale**: Transform scale(1.02) with 300ms ease-out
- **Image Zoom**: Transform scale(1.10) on parent hover
- **Shadow Lift**: Shadow-md → shadow-2xl transition
- **Button Press**: Active scale(0.98) for tactile feedback
- **Skeleton Pulse**: Gradient animation for loading state

---

## 🚀 Quick Start

1. **Import components**:

```tsx
import { ProjectCard, ProjectList, SkeletonCard } from "@/components";
```

2. **Use in your page**:

```tsx
"use client";

import { ProjectList } from "@/components";

export default function ProjectsPage() {
  const projects = [
    /* your data */
  ];

  return <ProjectList projects={projects} />;
}
```

3. **See full example**:

Check `example-usage.tsx` for a complete implementation with mock data.

---

## 🎯 Best Practices

1. **Images**: Use optimized images (WebP, AVIF) at ~800x600px
2. **Tags**: Keep 2-5 tags per project for best visual balance
3. **Descriptions**: Aim for 80-120 characters for optimal display
4. **onView**: Use for navigation, modals, or external links

---

## ♿ Accessibility

- Semantic HTML (`<article>`, `<button>`)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Screen reader friendly
- Proper heading hierarchy

---

## 🌗 Dark Mode

All components automatically support dark mode through Tailwind's `dark:` variants. No additional configuration needed!

---

## 📄 License

These components are part of the portfolio project and can be freely used and modified.
