/**
 * Integration test: the LAG-based transition query runs against real PostgreSQL.
 * Validates that getOnlineTransitions returns only transition rows (+ boundaries)
 * and that detectIncidents reconstructs the correct incidents from them.
 * Run with: npm run test:integration
 */
import { createTestDb } from "./db-helper";
import { getOnlineTransitions, detectIncidents } from "@/lib/incident-detection";

const db = createTestDb();
const TEST_PREFIX = `integ-incident-${Date.now()}`;

let deviceId: string;
const base = new Date("2024-06-01T00:00:00Z").getTime();
const at = (minutes: number) => new Date(base + minutes * 60_000);

beforeAll(async () => {
  const device = await db.device.create({
    data: { name: `${TEST_PREFIX}-dev`, ip: "10.77.0.1", type: "OTHER", checkInterval: 60, alertThreshold: 3 },
  });
  deviceId = device.id;

  // online, online, OFFLINE, offline, offline, ONLINE, online  → one resolved incident
  // The middle redundant rows (extra online/offline) must be collapsed by the query.
  await db.statusHistory.createMany({
    data: [
      { deviceId, isOnline: true,  timestamp: at(0) },
      { deviceId, isOnline: true,  timestamp: at(1) },
      { deviceId, isOnline: false, timestamp: at(2) },  // transition → incident start
      { deviceId, isOnline: false, timestamp: at(3) },  // redundant
      { deviceId, isOnline: false, timestamp: at(4) },  // redundant
      { deviceId, isOnline: true,  timestamp: at(5) },  // transition → incident end
      { deviceId, isOnline: true,  timestamp: at(6) },  // redundant + last
    ],
  });
});

afterAll(async () => {
  await db.statusHistory.deleteMany({ where: { deviceId } });
  await db.device.deleteMany({ where: { name: { startsWith: TEST_PREFIX } } });
  await db.$disconnect();
});

describe("getOnlineTransitions (real SQL)", () => {
  it("collapses redundant rows to transitions + first/last", async () => {
    const since = at(-10);
    const map = await getOnlineTransitions(since, db);
    const rows = map.get(deviceId);

    expect(rows).toBeDefined();
    // first(0), transition-off(2), transition-on(5), last(6) — the redundant 1,3,4 collapse out
    const minutes = rows!.map((r) => Math.round((r.timestamp.getTime() - base) / 60_000));
    expect(minutes).toEqual([0, 2, 5, 6]);
    expect(rows!.map((r) => r.isOnline)).toEqual([true, false, true, true]);
  });

  it("reconstructs the resolved incident from the reduced rows", async () => {
    const since = at(-10);
    const map = await getOnlineTransitions(since, db);
    const incidents = detectIncidents(map.get(deviceId)!, since);

    expect(incidents).toHaveLength(1);
    expect(incidents[0].resolved).toBe(true);
    expect(incidents[0].startAt).toBe(at(2).toISOString());
    expect(incidents[0].endAt).toBe(at(5).toISOString());
  });

  it("treats a device offline at the window start as an in-progress incident", async () => {
    // since AFTER the recovery point → the first row in-window is offline-free here,
    // so use a since between the offline rows to exercise the boundary case
    const since = at(3); // window starts mid-outage: first row is offline@3
    const map = await getOnlineTransitions(since, db);
    const incidents = detectIncidents(map.get(deviceId)!, since);

    expect(incidents).toHaveLength(1);
    expect(incidents[0].startAt).toBe(since.toISOString()); // boundary start
    expect(incidents[0].endAt).toBe(at(5).toISOString());
  });
});
