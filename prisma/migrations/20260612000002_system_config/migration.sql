CREATE TABLE "SystemConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "statusHistoryDays" INTEGER NOT NULL DEFAULT 30,
    "linkEventDays" INTEGER NOT NULL DEFAULT 90,
    "lastCleanupAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SystemConfig" ("id", "statusHistoryDays", "linkEventDays", "updatedAt")
VALUES (1, 30, 90, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
