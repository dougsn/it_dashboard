/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: { count: jest.fn() },
    link: { count: jest.fn() },
  },
}));

import { GET } from "@/app/api/counts/route";
import { db } from "@/lib/db";

const mockDb = db as unknown as { device: { count: jest.Mock }; link: { count: jest.Mock } };

beforeEach(() => jest.clearAllMocks());

describe("GET /api/counts", () => {
  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("computes offline devices as total minus online", async () => {
    // device.count: 1st call = total (10), 2nd call = online (7)
    mockDb.device.count.mockResolvedValueOnce(10).mockResolvedValueOnce(7);
    // link.count: 1st = total (4), 2nd = online (3)
    mockDb.link.count.mockResolvedValueOnce(4).mockResolvedValueOnce(3);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ devicesTotal: 10, devicesOffline: 3, linksOnline: 3, linksTotal: 4 });
  });
});
