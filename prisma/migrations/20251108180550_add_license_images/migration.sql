-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "licenseFrontImage" TEXT,
ADD COLUMN IF NOT EXISTS "licenseBackImage" TEXT;
