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

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 User Credentials:');
  console.log(`   OWNER:  ${adminEmail} / ${adminPassword}`);
  console.log(`   VIEWER: viewer@example.com / viewer123`);
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
