-- AlterEnum
ALTER TYPE "DeviceType" ADD VALUE 'OMADA_AP';

-- AlterTable: add Omada config fields to Device
ALTER TABLE "Device"
  ADD COLUMN "omadaEnabled"      BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "omadaUserEnc"      TEXT,
  ADD COLUMN "omadaPassEnc"      TEXT,
  ADD COLUMN "omadaPort"         INTEGER NOT NULL DEFAULT 8043,
  ADD COLUMN "omadaSite"         TEXT NOT NULL DEFAULT 'Default',
  ADD COLUMN "omadaTlsVerify"    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "omadaControllerIp" TEXT;

-- AlterTable: add Omada result fields to DeviceStatus
ALTER TABLE "DeviceStatus"
  ADD COLUMN "omadaData"  JSONB,
  ADD COLUMN "omadaError" TEXT;
