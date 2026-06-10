-- Replace unifiUserEnc/unifiPassEnc with unifiApiKeyEnc (X-API-KEY auth)
ALTER TABLE "Device" ADD COLUMN "unifiApiKeyEnc" TEXT;
ALTER TABLE "Device" DROP COLUMN IF EXISTS "unifiUserEnc";
ALTER TABLE "Device" DROP COLUMN IF EXISTS "unifiPassEnc";
-- Change default port from 8443 to 443 (UniFi OS uses 443)
ALTER TABLE "Device" ALTER COLUMN "unifiPort" SET DEFAULT 443;
