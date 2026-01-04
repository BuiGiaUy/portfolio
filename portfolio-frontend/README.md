# Portfolio Frontend

Modern Next.js 14 application with App Router, React Query, and TypeScript.

## Features

- ⚛️ **Next.js 14** - App Router with Server/Client Components
- 🔄 **React Query (TanStack Query)** - State management & caching
- 🎨 **Tailwind CSS** - Utility-first styling
- 🌐 **i18n Support** - English & Vietnamese translations
- 🔐 **Secure Authentication** - JWT with HttpOnly cookies
- 🧪 **E2E Testing** - Playwright test suite

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure .env.local with backend URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
app/
├── (routes)/
│   ├── page.tsx                # Landing page
│   ├── login/                  # Auth pages
│   ├── dashboard/              # Protected dashboard
│   └── projects/               # Project pages
│
components/
├── Navbar.tsx                  # Navigation
├── ProjectsGrid.tsx            # Project listing
└── upload/                     # File upload components
│
lib/
├── api/                        # API client
│   ├── api-client.ts
│   └── error-handler.ts
├── query/                      # React Query hooks
│   └── projects.ts
├── i18n/                       # Translations
│   ├── auth.ts
│   ├── dashboard.ts
│   └── settings.ts
└── sentry.ts                   # Error tracking
│
services/
└── project.service.ts          # API services
│
hooks/
├── useAuth.ts                  # Authentication
└── useHomePageLogic.ts         # Custom hooks
```

## Environment Variables

Create `.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ENV=development
```

## Scripts

| Command               | Description                          |
| --------------------- | ------------------------------------ |
| `npm run dev`         | Start development server (port 3001) |
| `npm run build`       | Build for production                 |
| `npm start`           | Start production server              |
| `npm run lint`        | Run ESLint                           |
| `npm run test:e2e`    | Run Playwright E2E tests             |
| `npm run test:e2e:ui` | Run tests with UI debugger           |

## Key Technologies

### Data Fetching

- **Server Components**: Direct database/API access (SSR)
- **Client Components**: React Query for interactivity
- **Optimistic Updates**: Instant UI feedback

### Authentication

- **JWT Tokens**: HttpOnly cookies
- **Protected Routes**: Middleware-based route guards
- **Auto Refresh**: Automatic token rotation

### State Management

- **React Query**: Server state (API data)
- **React Context**: UI state (theme, language)
- **URL State**: Search params, filters

## React Query Patterns

### Fetching Data

```typescript
// Custom hook
function useProjects() {
  return useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectService.getProjects(),
    staleTime: 60_000, // Fresh for 60s
  });
}

// In component
const { data: projects, isLoading, error } = useProjects();
```

### Mutations

```typescript
function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      // Invalidate to refetch
      queryClient.invalidateQueries(["projects"]);
    },
  });
}
```

## Internationalization

```typescript
// Import translations
import { useLanguage } from "@/components/LanguageProvider";
import { authTranslations } from "@/lib/i18n/auth";

// In component
const { language } = useLanguage();
const t = authTranslations[language].login;

// Use
<h1>{t.title}</h1>; // "Welcome Back" or "Chào Mừng"
```

## E2E Testing

```bash
# Install Playwright
npx playwright install

# Run tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug
npm run test:e2e:debug
```

Tests located in `e2e/tests/`:

- `auth.spec.ts` - Login/logout flows
- `protected-routes.spec.ts` - Route guards
- `projects.spec.ts` - CRUD operations

## Building for Production

```bash
# Build
npm run build

# Start production server
npm start
```

Optimizations:

- ✅ Code splitting
- ✅ Image optimization (next/image)
- ✅ Font optimization (next/font)
- ✅ Bundle analysis
- ✅ Server-side rendering (SSR)

## Deployment

### Docker

```bash
# From root directory
docker compose build frontend
docker compose up frontend
```

### Vercel/Netlify

1. Connect repository
2. Set environment variables
3. Build command: `npm run build`
4. Output directory: `.next`

---

**For architecture details, see [../ARCHITECTURE.md](../ARCHITECTURE.md)**
