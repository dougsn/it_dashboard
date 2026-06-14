/**
 * @jest-environment node
 */
import { POST } from "@/app/api/auth/rate-check/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  db: {
    $queryRaw: jest.fn(),
  },
}));

import { db } from "@/lib/db";

const mockQueryRaw = (db as unknown as { $queryRaw: jest.Mock }).$queryRaw;

const SECRET = "test-secret-value";

function makeReq(body: object, secret = SECRET) {
  return new NextRequest("http://localhost/api/auth/rate-check", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXTAUTH_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.NEXTAUTH_SECRET;
});

describe("POST /api/auth/rate-check", () => {
  it("returns 403 when Authorization header is missing", async () => {
    const req = new NextRequest("http://localhost/api/auth/rate-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: "1.2.3.4" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 403 when secret is wrong", async () => {
    const res = await POST(makeReq({ ip: "1.2.3.4" }, "wrong-secret"));
    expect(res.status).toBe(403);
  });

  it("returns 400 when ip is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("allows first attempt (count = 1)", async () => {
    mockQueryRaw.mockResolvedValue([{ count: 1 }]);
    const res = await POST(makeReq({ ip: "1.1.1.1" }));
    const body = await res.json() as { allowed: boolean; remaining: number };
    expect(res.status).toBe(200);
    expect(body.allowed).toBe(true);
    expect(body.remaining).toBe(9);
  });

  it("blocks attempt when count exceeds MAX_ATTEMPTS (count = 11)", async () => {
    mockQueryRaw.mockResolvedValue([{ count: 11 }]);
    const res = await POST(makeReq({ ip: "3.3.3.3" }));
    const body = await res.json() as { allowed: boolean; remaining: number };
    expect(body.allowed).toBe(false);
    expect(body.remaining).toBe(0);
  });

  it("allows attempt at exactly MAX_ATTEMPTS (count = 10)", async () => {
    mockQueryRaw.mockResolvedValue([{ count: 10 }]);
    const res = await POST(makeReq({ ip: "4.4.4.4" }));
    const body = await res.json() as { allowed: boolean; remaining: number };
    expect(body.allowed).toBe(true);
    expect(body.remaining).toBe(0);
  });

  it("performs the atomic upsert via a single query", async () => {
    mockQueryRaw.mockResolvedValue([{ count: 4 }]);
    await POST(makeReq({ ip: "5.5.5.5" }));
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
  });

  it("coerces bigint count from Postgres", async () => {
    mockQueryRaw.mockResolvedValue([{ count: 2n as unknown as number }]);
    const res = await POST(makeReq({ ip: "6.6.6.6" }));
    const body = await res.json() as { allowed: boolean; remaining: number };
    expect(body.allowed).toBe(true);
    expect(body.remaining).toBe(8);
  });
});
