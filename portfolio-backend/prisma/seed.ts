import { PrismaClient, Role } from './generated/prisma/client';
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

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 User Credentials:');
  console.log(`   OWNER:     ${adminEmail} / ${adminPassword}`);
  console.log(`   VIEWER:    viewer@example.com / viewer123`);
  console.log(`   E2E Admin: admin@example.com / Admin123!@#`);
  console.log(`   E2E User:  user@example.com / User123!@#`);
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
