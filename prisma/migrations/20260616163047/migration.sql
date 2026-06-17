-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "unifiTlsVerify" SET DEFAULT true;

-- AlterTable
ALTER TABLE "SystemConfig" ALTER COLUMN "updatedAt" DROP DEFAULT;
