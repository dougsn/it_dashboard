-- Remove colunas de credenciais RouterOS em texto plano (SEC-029)
-- Substituídas por routerosUserEnc e routerosPassEnc (AES-256-GCM) desde migrate-credentials.ts
ALTER TABLE "Device" DROP COLUMN IF EXISTS "routerosUser";
ALTER TABLE "Device" DROP COLUMN IF EXISTS "routerosPass";
