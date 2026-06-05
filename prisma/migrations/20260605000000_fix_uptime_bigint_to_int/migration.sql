-- AlterTable: change uptime from BigInt to Int (max uptime ~68 years, well within Int range)
ALTER TABLE "DeviceStatus" ALTER COLUMN "uptime" TYPE INTEGER USING "uptime"::INTEGER;
