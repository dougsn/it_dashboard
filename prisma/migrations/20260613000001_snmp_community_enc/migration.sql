-- Adiciona coluna criptografada para snmpCommunity (SEC-033)
-- snmpCommunity permanece como fallback para registros existentes
ALTER TABLE "Device" ADD COLUMN IF NOT EXISTS "snmpCommunityEnc" TEXT;
