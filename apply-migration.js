const { PrismaClient } = require('@prisma/client');

async function applyMigration() {
  const prisma = new PrismaClient();

  try {
    // Add isArchived column to Event table
    await prisma.$executeRaw`ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;`;
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();