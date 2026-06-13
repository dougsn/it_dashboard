/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    link: { findUnique: jest.fn() },
    linkEvent: { findMany: jest.fn(), findFirst: jest.fn() },
  },
}));

import { GET } from "@/app/api/links/[id]/events/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const LINK = { id: "link1", name: "Fibra", isOnline: true };
const EVENT = { id: "e1", linkId: "link1", type: "UP", timestamp: new Date("2026-01-01T10:00:00Z") };

function makeReq(id: string, hours?: number) {
  const url = `http://localhost/api/links/${id}/events${hours ? `?hours=${hours}` : ""}`;
  return new Request(url);
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.link.findUnique as jest.Mock).mockResolvedValue(LINK);
  (mockDb.linkEvent.findMany as jest.Mock).mockResolvedValue([EVENT]);
  (mockDb.linkEvent.findFirst as jest.Mock).mockResolvedValue(null);
});

describe("GET /api/links/[id]/events", () => {
  it("returns link, events and lastBefore", async () => {
    const res = await GET(makeReq("link1"), { params: Promise.resolve({ id: "link1" }) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.link).toMatchObject({ id: "link1" });
    expect(body.events).toHaveLength(1);
    expect(body.lastBefore).toBeNull();
  });

  it("returns 404 when link does not exist", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(makeReq("bad"), { params: Promise.resolve({ id: "bad" }) });
    expect(res.status).toBe(404);
  });

  it("defaults hours to 24", async () => {
    await GET(makeReq("link1"), { params: Promise.resolve({ id: "link1" }) });
    const call = (mockDb.linkEvent.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.timestamp.gte).toBeInstanceOf(Date);
  });

  it("clamps hours to 720", async () => {
    await GET(makeReq("link1", 9999), { params: Promise.resolve({ id: "link1" }) });
    const call = (mockDb.linkEvent.findMany as jest.Mock).mock.calls[0][0];
    const diffH = (Date.now() - call.where.timestamp.gte.getTime()) / 3_600_000;
    expect(diffH).toBeLessThanOrEqual(721);
  });

  it("includes lastBefore event when one exists before the window", async () => {
    const before = { id: "e0", type: "DOWN", timestamp: new Date("2025-12-31") };
    (mockDb.linkEvent.findFirst as jest.Mock).mockResolvedValue(before);
    const res = await GET(makeReq("link1"), { params: Promise.resolve({ id: "link1" }) });
    const body = await res.json();
    expect(body.lastBefore).toMatchObject({ id: "e0" });
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET(makeReq("link1"), { params: Promise.resolve({ id: "link1" }) });
    expect(res.status).toBe(401);
  });
});
