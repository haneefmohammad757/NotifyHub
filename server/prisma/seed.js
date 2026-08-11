import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Idempotent seed script for NotifyHub.
 * Uses upsert to prevent duplicate records on repeated runs.
 * Passwords are hashed with bcrypt — never stored as plain text.
 */
async function main() {
  console.log('Seeding NotifyHub database...');

  // ─── Users ─────────────────────────────────────────────

  const adminHash = await bcrypt.hash('haneef5406', SALT_ROUNDS);
  const student1Hash = await bcrypt.hash('yash123', SALT_ROUNDS);
  const student2Hash = await bcrypt.hash('sharma123', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@notifyhub' },
    update: { name: 'ADMIN', passwordHash: adminHash },
    create: {
      name: 'ADMIN',
      email: 'admin@notifyhub',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'yash.kumar@notifyhub' },
    update: { passwordHash: student1Hash },
    create: {
      name: 'Yash Kumar',
      email: 'yash.kumar@notifyhub',
      passwordHash: student1Hash,
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'pooja.sharma@notifyhub' },
    update: { passwordHash: student2Hash },
    create: {
      name: 'Pooja Sharma',
      email: 'pooja.sharma@notifyhub',
      passwordHash: student2Hash,
      role: 'STUDENT',
    },
  });

  console.log(`  Users: ${admin.name}, ${student1.name}, ${student2.name}`);












}

main()
  .catch((e) => {
    console.error('Seed error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
