-- Migrate Omada integration from traditional username/password API to Northbound OAuth2 API.
-- Old fields (omadaUserEnc, omadaPassEnc, omadaPort) are replaced by
-- omadaClientIdEnc, omadaClientSecretEnc, omadacId, omadaSiteId.

-- Rename credential columns
ALTER TABLE "Device" RENAME COLUMN "omadaUserEnc" TO "omadaClientIdEnc";
ALTER TABLE "Device" RENAME COLUMN "omadaPassEnc" TO "omadaClientSecretEnc";

-- Clear old values: they held username/password, not OAuth2 client_id/secret
UPDATE "Device" SET "omadaClientIdEnc" = NULL, "omadaClientSecretEnc" = NULL;

-- Remove port column (Northbound API always uses HTTPS/443)
ALTER TABLE "Device" DROP COLUMN "omadaPort";

-- omadaSite becomes nullable (populated from API site picker)
ALTER TABLE "Device" ALTER COLUMN "omadaSite" DROP NOT NULL;
ALTER TABLE "Device" ALTER COLUMN "omadaSite" DROP DEFAULT;

-- New fields
ALTER TABLE "Device"
  ADD COLUMN "omadacId"   TEXT,
  ADD COLUMN "omadaSiteId" TEXT;
