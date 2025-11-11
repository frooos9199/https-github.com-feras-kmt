-- AlterTable: Add cancellation fields to Attendance
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;

-- CreateTable: BroadcastMessage
CREATE TABLE IF NOT EXISTS "BroadcastMessage" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipientFilter" TEXT NOT NULL,
    "marshalTypes" TEXT,
    "eventId" TEXT,
    "sendEmail" BOOLEAN NOT NULL DEFAULT true,
    "sendNotification" BOOLEAN NOT NULL DEFAULT true,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "sentBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BroadcastMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BroadcastMessage_sentAt_idx" ON "BroadcastMessage"("sentAt");
