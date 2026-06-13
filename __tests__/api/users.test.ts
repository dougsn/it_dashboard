/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    user: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
  },
}));

jest.mock("@/lib/audit", () => ({ writeAudit: jest.fn() }));

jest.mock("bcryptjs", () => ({ hash: jest.fn().mockResolvedValue("$hashed$") }));

import { GET, POST } from "@/app/api/users/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const USER = { id: "u1", username: "admin", role: "ADMIN", createdAt: new Date() };

function makeReq(body: unknown) {
  return new Request("http://localhost/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.user.findMany as jest.Mock).mockResolvedValue([USER]);
  (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);
  (mockDb.user.create as jest.Mock).mockResolvedValue({ ...USER, id: "u2", username: "new_user" });
});

describe("GET /api/users", () => {
  it("returns user list", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].username).toBe("admin");
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is VIEWER", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "VIEWER" } });
    const res = await GET();
    expect(res.status).toBe(403);
  });
});

describe("POST /api/users", () => {
  it("creates a new user", async () => {
    const res = await POST(makeReq({ username: "new_user", password: "password123", role: "OPERADOR" }));
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.username).toBe("new_user");
  });

  it("returns 409 when username already exists", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(USER);
    const res = await POST(makeReq({ username: "admin", password: "password123", role: "ADMIN" }));
    expect(res.status).toBe(409);
  });

  it("returns 400 for invalid username (too short)", async () => {
    const res = await POST(makeReq({ username: "ab", password: "password123", role: "ADMIN" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid role", async () => {
    const res = await POST(makeReq({ username: "validuser", password: "password123", role: "SUPERADMIN" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for weak password (< 8 chars)", async () => {
    const res = await POST(makeReq({ username: "validuser", password: "pass", role: "ADMIN" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "bad",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ username: "newuser", password: "password123", role: "ADMIN" }));
    expect(res.status).toBe(401);
  });
});
