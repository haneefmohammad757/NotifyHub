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

  const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
  const student1Hash = await bcrypt.hash('student123', SALT_ROUNDS);
  const student2Hash = await bcrypt.hash('student123', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@notifyhub.edu' },
    update: { name: 'Balaji Lanka', passwordHash: adminHash },
    create: {
      name: 'Balaji Lanka',
      email: 'admin@notifyhub.edu',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'rahul.kumar@notifyhub.edu' },
    update: { passwordHash: student1Hash },
    create: {
      name: 'Rahul Kumar',
      email: 'rahul.kumar@notifyhub.edu',
      passwordHash: student1Hash,
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'priya.sharma@notifyhub.edu' },
    update: { passwordHash: student2Hash },
    create: {
      name: 'Priya Sharma',
      email: 'priya.sharma@notifyhub.edu',
      passwordHash: student2Hash,
      role: 'STUDENT',
    },
  });

  console.log(`  Users: ${admin.name}, ${student1.name}, ${student2.name}`);

  // ─── Announcements ────────────────────────────────────

  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-1' },
    update: {},
    create: {
      id: 'seed-announcement-1',
      title: 'End-Semester Examination Timetable Released',
      description: 'The examination timetable for the end-semester exams has been published. Please check the examination cell portal for your schedule.',
      category: 'EXAM',
      priority: 'IMPORTANT',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      createdBy: admin.id,
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-2' },
    update: {},
    create: {
      id: 'seed-announcement-2',
      title: 'Campus Placement Registration Open',
      description: 'Registration for the upcoming campus placement drive is now open. Eligible students must register before the deadline.',
      category: 'PLACEMENT',
      priority: 'URGENT',
      status: 'PUBLISHED',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(),
      createdBy: admin.id,
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-3' },
    update: {},
    create: {
      id: 'seed-announcement-3',
      title: 'Library Hours Extended During Exams',
      description: 'The central library will remain open until 11:00 PM during the examination period to support student preparation.',
      category: 'GENERAL',
      priority: 'NORMAL',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      createdBy: admin.id,
    },
  });

  console.log('  Announcements seeded.');

  // ─── Events ────────────────────────────────────────────

  await prisma.event.upsert({
    where: { id: 'seed-event-1' },
    update: {},
    create: {
      id: 'seed-event-1',
      title: 'AI & Machine Learning Workshop',
      description: 'A hands-on workshop covering fundamentals of AI and ML with practical exercises using Python.',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      startTime: '14:00',
      endTime: '17:00',
      venue: 'Seminar Hall A',
      organizer: 'Department of Computer Science',
      registrationEnabled: true,
      registrationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      createdBy: admin.id,
    },
  });

  await prisma.event.upsert({
    where: { id: 'seed-event-2' },
    update: {},
    create: {
      id: 'seed-event-2',
      title: 'Annual Sports Meet',
      description: 'The annual inter-department sports meet. Events include athletics, basketball, and cricket.',
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '18:00',
      venue: 'University Sports Complex',
      organizer: 'Sports Committee',
      registrationEnabled: false,
      createdBy: admin.id,
    },
  });

  console.log('  Events seeded.');

  // ─── Queries ───────────────────────────────────────────

  await prisma.query.upsert({
    where: { id: 'seed-query-1' },
    update: {},
    create: {
      id: 'seed-query-1',
      subject: 'Hostel room allocation',
      message: 'When will the hostel room allocation for the new semester be announced?',
      status: 'OPEN',
      studentId: student1.id,
    },
  });

  await prisma.query.upsert({
    where: { id: 'seed-query-2' },
    update: {},
    create: {
      id: 'seed-query-2',
      subject: 'Scholarship application status',
      message: 'I submitted my scholarship application two weeks ago. Could you please update me on the status?',
      status: 'RESOLVED',
      response: 'Your scholarship application has been approved. The disbursement will happen by end of this month.',
      respondedBy: admin.id,
      respondedAt: new Date(),
      studentId: student2.id,
    },
  });

  console.log('  Queries seeded.');
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
