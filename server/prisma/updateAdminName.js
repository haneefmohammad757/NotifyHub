import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { role: 'ADMIN' },
    data: { name: 'ADMIN' }
  });
  console.log(`Updated ${result.count} admin user(s) to name 'ADMIN'.`);

  // Also check if user with email admin@notifyhub exists
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  console.log('Current Admin User in DB:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
