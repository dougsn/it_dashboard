-- Add dual-auth support for UniFi: API key OR username/password (Inform API)
ALTER TABLE "Device" ADD COLUMN "unifiAuthMethod" TEXT NOT NULL DEFAULT 'apikey';
ALTER TABLE "Device" ADD COLUMN "unifiUserEnc" TEXT;
ALTER TABLE "Device" ADD COLUMN "unifiPassEnc" TEXT;
