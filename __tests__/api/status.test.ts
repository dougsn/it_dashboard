/**
 * @jest-environment node
 */
import { GET } from "@/app/api/status/[deviceId]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    statusHistory: {
      findMany: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;

const FAKE_SESSION = { user: { id: "user-1", name: "admin", role: "ADMIN" }, expires: "2099-01-01" };
const FAKE_PARAMS = Promise.resolve({ deviceId: "device-1" });

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/status/:deviceId", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const req = new NextRequest("http://localhost/api/status/device-1");

    const res = await GET(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(401);
  });

  it("returns history records for default 24 hours", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const fakeHistory = [
      { id: "h1", deviceId: "device-1", isOnline: true, pingMs: 10, timestamp: new Date() },
    ];
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(fakeHistory);

    const req = new NextRequest("http://localhost/api/status/device-1");
    const res = await GET(req, { params: FAKE_PARAMS });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].isOnline).toBe(true);
  });

  it("caps hours at 168 (7 days)", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);

    const req = new NextRequest("http://localhost/api/status/device-1?hours=9999");
    const res = await GET(req, { params: FAKE_PARAMS });

    expect(res.status).toBe(200);
    const call = (mockDb.statusHistory.findMany as jest.Mock).mock.calls[0][0];
    // The 'since' date should be roughly 168 hours ago, not 9999 hours
    const since: Date = call.where.timestamp.gte;
    const hoursAgo = (Date.now() - since.getTime()) / (1000 * 60 * 60);
    expect(hoursAgo).toBeLessThanOrEqual(169); // allow 1h margin
  });

  it("returns empty array when no history exists", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);

    const req = new NextRequest("http://localhost/api/status/device-1");
    const res = await GET(req, { params: FAKE_PARAMS });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});
