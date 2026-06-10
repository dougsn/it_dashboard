-- Add UNIFI_AP to DeviceType enum
ALTER TYPE "DeviceType" ADD VALUE 'UNIFI_AP';

-- Add UniFi fields to Device table
ALTER TABLE "Device" ADD COLUMN "unifiEnabled"   BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Device" ADD COLUMN "unifiUserEnc"   TEXT;
ALTER TABLE "Device" ADD COLUMN "unifiPassEnc"   TEXT;
ALTER TABLE "Device" ADD COLUMN "unifiPort"      INTEGER NOT NULL DEFAULT 8443;
ALTER TABLE "Device" ADD COLUMN "unifiSite"      TEXT NOT NULL DEFAULT 'default';
ALTER TABLE "Device" ADD COLUMN "unifiTlsVerify" BOOLEAN NOT NULL DEFAULT false;

-- Add unifiData JSON field to DeviceStatus
ALTER TABLE "DeviceStatus" ADD COLUMN "unifiData" JSONB;
