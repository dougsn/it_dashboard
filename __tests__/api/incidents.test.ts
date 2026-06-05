/**
 * @jest-environment node
 */
import { GET } from "@/app/api/incidents/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: {
      findMany: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;

const FAKE_SESSION = { user: { id: "user-1", name: "admin" }, expires: "2099-01-01" };

function makeReq(params = "") {
  return new NextRequest(`http://localhost/api/incidents${params}`);
}

function makeDevice(history: { isOnline: boolean; timestamp: Date }[]) {
  return {
    id: "device-1",
    name: "Router SP",
    type: "MIKROTIK",
    currentStatus: null,
    history,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/incidents", () => {
  it("returns 401 when not authenticated (regression: endpoint was public)", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it("returns empty array when no devices exist", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(0);
  });

  it("returns empty array when device has no history in window", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([makeDevice([])]);

    const res = await GET(makeReq());
    const data = await res.json();
    expect(data).toHaveLength(0);
  });

  it("detects a resolved incident from online→offline→online transitions", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const t1 = new Date("2024-01-01T10:00:00Z");
    const t2 = new Date("2024-01-01T10:05:00Z"); // went offline
    const t3 = new Date("2024-01-01T10:10:00Z"); // came back

    (mockDb.device.findMany as jest.Mock).mockResolvedValue([
      makeDevice([
        { isOnline: true,  timestamp: t1 },
        { isOnline: false, timestamp: t2 },
        { isOnline: true,  timestamp: t3 },
      ]),
    ]);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].resolved).toBe(true);
    expect(data[0].startAt).toBe(t2.toISOString());
    expect(data[0].endAt).toBe(t3.toISOString());
    expect(data[0].durationMs).toBe(t3.getTime() - t2.getTime());
  });

  it("detects an open incident when last state is offline", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const t1 = new Date("2024-01-01T10:00:00Z");
    const t2 = new Date("2024-01-01T10:05:00Z"); // went offline, still down

    (mockDb.device.findMany as jest.Mock).mockResolvedValue([
      makeDevice([
        { isOnline: true,  timestamp: t1 },
        { isOnline: false, timestamp: t2 },
      ]),
    ]);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].resolved).toBe(false);
    expect(data[0].endAt).toBeNull();
    expect(data[0].startAt).toBe(t2.toISOString());
  });

  it("treats first record offline as incident starting at window boundary", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const t1 = new Date("2024-01-01T10:00:00Z");
    const t2 = new Date("2024-01-01T10:30:00Z"); // came back

    (mockDb.device.findMany as jest.Mock).mockResolvedValue([
      makeDevice([
        { isOnline: false, timestamp: t1 }, // already offline at start of window
        { isOnline: true,  timestamp: t2 },
      ]),
    ]);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].resolved).toBe(true);
    expect(data[0].endAt).toBe(t2.toISOString());
  });

  it("caps ?hours= at 720", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([]);

    await GET(makeReq("?hours=9999"));

    const callArgs = (mockDb.device.findMany as jest.Mock).mock.calls[0][0];
    const since: Date = callArgs.include.history.where.timestamp.gte;
    const windowHours = (Date.now() - since.getTime()) / 3_600_000;
    expect(windowHours).toBeLessThanOrEqual(720 + 1); // allow 1h tolerance
  });

  it("returns incidents sorted by startAt descending", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const times = [
      new Date("2024-01-01T08:00:00Z"),
      new Date("2024-01-01T08:05:00Z"),
      new Date("2024-01-01T08:10:00Z"),
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-01T09:05:00Z"),
      new Date("2024-01-01T09:10:00Z"),
    ];

    // Two separate incidents: first at 08:05, second at 09:05
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([
      makeDevice([
        { isOnline: true,  timestamp: times[0] },
        { isOnline: false, timestamp: times[1] },
        { isOnline: true,  timestamp: times[2] },
        { isOnline: false, timestamp: times[3] },
        { isOnline: false, timestamp: times[4] },
        { isOnline: true,  timestamp: times[5] },
      ]),
    ]);

    const res = await GET(makeReq());
    const data = await res.json();

    expect(data).toHaveLength(2);
    // Most recent first
    expect(new Date(data[0].startAt).getTime()).toBeGreaterThan(
      new Date(data[1].startAt).getTime()
    );
  });
});
