/**
 * @jest-environment node
 */
import { GET } from "@/app/api/overview/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    statusHistory: { findMany: jest.fn() },
    link: { findMany: jest.fn() },
    linkEvent: { findMany: jest.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;

const FAKE_SESSION = { user: { id: "user-1", name: "admin" }, expires: "2099-01-01" };

function makeReq() {
  return new NextRequest("http://localhost/api/overview");
}

function emptyDb() {
  (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
  (mockDb.link.findMany as jest.Mock).mockResolvedValue([]);
  (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([]);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/overview", () => {
  it("returns 401 when not authenticated (regression: endpoint was public)", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns sparklines and linkSegments structure when empty", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    emptyDb();

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("sparklines");
    expect(data).toHaveProperty("linkSegments");
  });

  it("builds sparklines with null for offline checks", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([
      { deviceId: "d1", isOnline: true,  pingMs: 10 },
      { deviceId: "d1", isOnline: false, pingMs: null },
      { deviceId: "d1", isOnline: true,  pingMs: 20 },
    ]);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.sparklines["d1"]).toEqual([10, null, 20]);
  });

  it("caps sparklines at last 60 entries", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const history = Array.from({ length: 80 }, (_, i) => ({
      deviceId: "d1",
      isOnline: true,
      pingMs: i + 1,
    }));
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(history);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.sparklines["d1"]).toHaveLength(60);
    // Should keep the last 60 (21..80)
    expect(data.sparklines["d1"][0]).toBe(21);
    expect(data.sparklines["d1"][59]).toBe(80);
  });

  it("produces 24 segments per link", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([{ id: "link-1", isOnline: true }]);
    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.linkSegments["link-1"]).toHaveLength(24);
  });

  it("fills segments with 'online' when link.isOnline=true and no events", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([{ id: "link-1", isOnline: true }]);
    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.linkSegments["link-1"].every((s: string) => s === "online")).toBe(true);
  });

  it("fills segments with 'offline' when link.isOnline=false and no events", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([{ id: "link-1", isOnline: false }]);
    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.linkSegments["link-1"].every((s: string) => s === "offline")).toBe(true);
  });

  it("marks a segment as 'degraded' when it has DOWN then UP events", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([{ id: "link-1", isOnline: true }]);

    const now = Date.now();
    // Place DOWN and UP both inside the most recent hour (segment 23)
    const downTs = new Date(now - 30 * 60_000); // 30 min ago
    const upTs   = new Date(now - 10 * 60_000); // 10 min ago

    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([
      { linkId: "link-1", type: "DOWN", timestamp: downTs },
      { linkId: "link-1", type: "UP",   timestamp: upTs   },
    ]);

    const res = await GET();
    const data = await res.json();
    const segments: string[] = data.linkSegments["link-1"];
    expect(segments[23]).toBe("degraded");
  });

  it("marks a segment as 'offline' when it ends with a DOWN event", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([{ id: "link-1", isOnline: false }]);

    const now = Date.now();
    const downTs = new Date(now - 20 * 60_000);

    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([
      { linkId: "link-1", type: "DOWN", timestamp: downTs },
    ]);

    const res = await GET();
    const data = await res.json();
    const segments: string[] = data.linkSegments["link-1"];
    expect(segments[23]).toBe("offline");
  });

  it("handles multiple links independently without cross-contamination", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([
      { id: "link-A", isOnline: true  },
      { id: "link-B", isOnline: false },
    ]);
    (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([]);

    const res = await GET();
    const data = await res.json();
    expect(data.linkSegments["link-A"].every((s: string) => s === "online")).toBe(true);
    expect(data.linkSegments["link-B"].every((s: string) => s === "offline")).toBe(true);
  });
});
