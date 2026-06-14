-- Standalone timestamp indexes for fleet-wide time-range queries.
-- The existing composite indexes ([deviceId, timestamp] / [linkId, timestamp]) lead
-- with the entity id, so timestamp-only range filters seq-scan the whole table.

-- StatusHistory: health uptime%, overview sparklines, timeline, incidents, pruning
CREATE INDEX "StatusHistory_timestamp_idx" ON "StatusHistory"("timestamp");

-- LinkEvent: overview "last event before window" (DISTINCT ON) and pruning
CREATE INDEX "LinkEvent_timestamp_idx" ON "LinkEvent"("timestamp");
