import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Initialize Prisma adapter
const adapter = new PrismaPg(pool);

// Create PrismaClient with the adapter
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});
async function main() {

  const SALT_ROUNDS = 10;

  // Get admin credentials from environment
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@portfolio.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
  const viewerPasswordHash = await bcrypt.hash('viewer123', SALT_ROUNDS);
  
  // E2E test users
  const e2eAdminPasswordHash = await bcrypt.hash('Admin123!@#', SALT_ROUNDS);
  const e2eUserPasswordHash = await bcrypt.hash('User123!@#', SALT_ROUNDS);

  console.log('🌱 Starting database seed...\n');

  // Seed OWNER user
  const owner = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.OWNER,
      active: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.OWNER,
      active: true,
    },
  });

  console.log('✅ Created OWNER user:', {
    id: owner.id,
    email: owner.email,
    role: owner.role,
  });

  // Seed VIEWER user
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {
      passwordHash: viewerPasswordHash,
      role: Role.VIEWER,
      active: true,
    },
    create: {
      email: 'viewer@example.com',
      passwordHash: viewerPasswordHash,
      role: Role.VIEWER,
      active: true,
    },
  });

  console.log('✅ Created VIEWER user:', {
    id: viewer.id,
    email: viewer.email,
    role: viewer.role,
  });

  // Seed E2E Admin user (for Playwright tests)
  const e2eAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: e2eAdminPasswordHash,
      role: Role.OWNER,
      active: true,
    },
    create: {
      email: 'admin@example.com',
      passwordHash: e2eAdminPasswordHash,
      role: Role.OWNER,
      active: true,
    },
  });

  console.log('✅ Created E2E Admin user:', {
    id: e2eAdmin.id,
    email: e2eAdmin.email,
    role: e2eAdmin.role,
  });

  // Seed E2E Regular user (for Playwright tests)
  const e2eUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      passwordHash: e2eUserPasswordHash,
      role: Role.VIEWER,
      active: true,
    },
    create: {
      email: 'user@example.com',
      passwordHash: e2eUserPasswordHash,
      role: Role.VIEWER,
      active: true,
    },
  });

  console.log('✅ Created E2E User:', {
    id: e2eUser.id,
    email: e2eUser.email,
    role: e2eUser.role,
  });

  // Seed Portfolio Project
  const portfolioContent = `# Portfolio – Fullstack Production-Ready System

## 🎯 Overview

A production-ready personal portfolio demonstrating clean architecture, authentication, caching, and CI/CD deployment.

## 🏗️ Architecture

- **Backend**: NestJS with Clean Architecture (Domain → Application → Infrastructure → Interface)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and API caching
- **Frontend**: Next.js with React Query for data fetching
- **DevOps**: Docker, Nginx, GitHub Actions CI/CD

## ✨ Features

### Backend
- JWT Authentication with HttpOnly cookies
- Refresh token rotation
- Role-Based Access Control (RBAC)
- Rate limiting with Redis
- Transactional updates with optimistic/pessimistic locking
- RESTful API with proper error handling

### Frontend
- Server-side rendering (SSR) with Next.js
- Optimistic updates with React Query
- Responsive design
- Dark mode support

### DevOps
- Containerized with Docker
- Reverse proxy with Nginx
- Automated CI/CD pipeline
- Database migrations

## 🚀 Getting Started

\`\`\`bash
# Clone the repository
git clone https://github.com/yourname/portfolio

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## 📝 License

MIT License
`;

  const portfolioProject = await prisma.project.upsert({
    where: { slug: 'portfolio-fullstack-system' },
    update: {
      title: 'Portfolio – Fullstack Production-Ready System',
      shortDescription: 'A production-ready personal portfolio demonstrating clean architecture, authentication, caching, and CI/CD deployment.',
      content: portfolioContent,
      techStack: [
        'NestJS',
        'PostgreSQL',
        'Prisma',
        'Redis',
        'Next.js',
        'React Query',
        'Docker',
        'Nginx',
        'GitHub Actions',
      ],
      thumbnailUrl: 'https://your-cdn/portfolio-thumbnail.png',
      githubUrl: 'https://github.com/yourname/portfolio',
      demoUrl: 'https://your-domain.com',
    },
    create: {
      id: 'portfolio-project-id',
      title: 'Portfolio – Fullstack Production-Ready System',
      slug: 'portfolio-fullstack-system',
      shortDescription: 'A production-ready personal portfolio demonstrating clean architecture, authentication, caching, and CI/CD deployment.',
      content: portfolioContent,
      techStack: [
        'NestJS',
        'PostgreSQL',
        'Prisma',
        'Redis',
        'Next.js',
        'React Query',
        'Docker',
        'Nginx',
        'GitHub Actions',
      ],
      thumbnailUrl: 'https://your-cdn/portfolio-thumbnail.png',
      githubUrl: 'https://github.com/yourname/portfolio',
      demoUrl: 'https://your-domain.com',
      userId: owner.id,
    },
  });

  console.log('✅ Created Portfolio Project:', {
    id: portfolioProject.id,
    title: portfolioProject.title,
    slug: portfolioProject.slug,
  });

  // Seed Project Stats
  const portfolioStats = await prisma.projectStats.upsert({
    where: { projectId: portfolioProject.id },
    update: {
      views: 100,
      likes: 25,
    },
    create: {
      projectId: portfolioProject.id,
      views: 100,
      likes: 25,
    },
  });

  console.log('✅ Created Project Stats:', {
    projectId: portfolioStats.projectId,
    views: portfolioStats.views,
    likes: portfolioStats.likes,
  });

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 User Credentials:');
  console.log(`   OWNER:     ${adminEmail} / ${adminPassword}`);
  console.log(`   VIEWER:    viewer@example.com / viewer123`);
  console.log(`   E2E Admin: admin@example.com / Admin123!@#`);
  console.log(`   E2E User:  user@example.com / User123!@#`);
  console.log('\n📂 Projects:');
  console.log(`   Portfolio: ${portfolioProject.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
