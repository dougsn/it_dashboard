/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { link: { findUnique: jest.fn() } },
}));

jest.mock("@/lib/crypto", () => ({
  resolveRouterosCredentials: jest.fn(),
}));

jest.mock("@/worker/monitors/link-traffic", () => ({
  checkLinkTraffic: jest.fn(),
}));

import { GET } from "@/app/api/links/[id]/live-traffic/route";
import { db } from "@/lib/db";
import { resolveRouterosCredentials } from "@/lib/crypto";
import { checkLinkTraffic } from "@/worker/monitors/link-traffic";

const mockDb = db as jest.Mocked<typeof db>;
const mockCreds = resolveRouterosCredentials as jest.Mock;
const mockTraffic = checkLinkTraffic as jest.Mock;

const MIKROTIK = { id: "dev1", name: "MK", ip: "10.0.0.1", routerosPort: 8728, routerosEnabled: true };
const LINK = { id: "lnk1", mikrotikDevice: MIKROTIK, mikrotikInterface: "ether1" };

function makeReq(id: string) {
  return new Request(`http://localhost/api/links/${id}/live-traffic`);
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.link.findUnique as jest.Mock).mockResolvedValue(LINK);
  mockCreds.mockReturnValue({ user: "admin", pass: "pass" });
  mockTraffic.mockResolvedValue({ downloadBps: 1_000_000, uploadBps: 500_000 });
});

describe("GET /api/links/[id]/live-traffic", () => {
  it("returns traffic data", async () => {
    const res = await GET(makeReq("lnk1"), { params: Promise.resolve({ id: "lnk1" }) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.downloadBps).toBe(1_000_000);
    expect(body.uploadBps).toBe(500_000);
    expect(body.timestamp).toBeDefined();
  });

  it("returns 404 when link not found", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(makeReq("bad"), { params: Promise.resolve({ id: "bad" }) });
    expect(res.status).toBe(404);
  });

  it("returns 422 when link has no mikrotik device", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue({ id: "lnk1", mikrotikDevice: null, mikrotikInterface: null });
    const res = await GET(makeReq("lnk1"), { params: Promise.resolve({ id: "lnk1" }) });
    expect(res.status).toBe(422);
  });

  it("returns 422 when link has no interface configured", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue({ id: "lnk1", mikrotikDevice: MIKROTIK, mikrotikInterface: null });
    const res = await GET(makeReq("lnk1"), { params: Promise.resolve({ id: "lnk1" }) });
    expect(res.status).toBe(422);
  });

  it("returns 422 when credentials are missing", async () => {
    mockCreds.mockReturnValue(null);
    const res = await GET(makeReq("lnk1"), { params: Promise.resolve({ id: "lnk1" }) });
    expect(res.status).toBe(422);
  });

  it("returns 422 when checkLinkTraffic throws", async () => {
    mockTraffic.mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await GET(makeReq("lnk1"), { params: Promise.resolve({ id: "lnk1" }) });
    expect(res.status).toBe(422);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET(makeReq("lnk1"), { params: Promise.resolve({ id: "lnk1" }) });
    expect(res.status).toBe(401);
  });
});
