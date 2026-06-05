-- Add RouterOS traffic monitoring fields to Link
ALTER TABLE "Link" ADD COLUMN "location" TEXT;
ALTER TABLE "Link" ADD COLUMN "mikrotikDeviceId" TEXT;
ALTER TABLE "Link" ADD COLUMN "mikrotikInterface" TEXT;
ALTER TABLE "Link" ADD COLUMN "downloadBps" INTEGER;
ALTER TABLE "Link" ADD COLUMN "uploadBps" INTEGER;
ALTER TABLE "Link" ADD COLUMN "latencyMs" INTEGER;

-- Foreign key: Link.mikrotikDeviceId -> Device.id
ALTER TABLE "Link" ADD CONSTRAINT "Link_mikrotikDeviceId_fkey"
  FOREIGN KEY ("mikrotikDeviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
