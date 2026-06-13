/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
  },
}));

jest.mock("@/lib/audit", () => ({ writeAudit: jest.fn() }));

jest.mock("bcryptjs", () => ({ hash: jest.fn().mockResolvedValue("$hashed$") }));

import { PUT, DELETE } from "@/app/api/users/[id]/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const ADMIN_USER = { id: "u1", username: "admin", role: "ADMIN" };
const OTHER_USER = { id: "u2", username: "user2", role: "OPERADOR" };

function makePutReq(id: string, body: unknown) {
  return new Request(`http://localhost/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteReq(id: string) {
  return new Request(`http://localhost/api/users/${id}`, { method: "DELETE" });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.user.findUnique as jest.Mock).mockResolvedValue(OTHER_USER);
  (mockDb.user.update as jest.Mock).mockResolvedValue(OTHER_USER);
  (mockDb.user.delete as jest.Mock).mockResolvedValue(OTHER_USER);
  (mockDb.user.count as jest.Mock).mockResolvedValue(2);
});

describe("PUT /api/users/[id]", () => {
  it("admin can update another user's role", async () => {
    (mockDb.user.update as jest.Mock).mockResolvedValue({ ...OTHER_USER, role: "VIEWER" });
    const res = await PUT(makePutReq("u2", { role: "VIEWER" }), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(200);
  });

  it("admin can update password", async () => {
    const res = await PUT(makePutReq("u2", { password: "newpassword123" }), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(200);
  });

  it("returns 400 when no fields provided", async () => {
    const res = await PUT(makePutReq("u2", {}), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(400);
  });

  it("returns 400 for weak password", async () => {
    const res = await PUT(makePutReq("u2", { password: "abc" }), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(400);
  });

  it("returns 403 when non-admin tries to update another user", async () => {
    // PUT route calls auth() twice: once directly, once via getSessionRole()
    const { auth } = require("@/lib/auth");
    const session = { user: { id: "u1", role: "OPERADOR" } };
    auth.mockResolvedValueOnce(session).mockResolvedValueOnce(session);
    const res = await PUT(makePutReq("u2", { password: "newpassword123" }), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(403);
  });

  it("returns 403 when non-admin tries to change role", async () => {
    const { auth } = require("@/lib/auth");
    // User u2 editing their own account but trying to escalate to ADMIN — also forbidden
    const session = { user: { id: "u2", role: "OPERADOR" } };
    auth.mockResolvedValueOnce(session).mockResolvedValueOnce(session);
    const res = await PUT(makePutReq("u2", { role: "ADMIN" }), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(403);
  });

  it("returns 404 when user not found", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await PUT(makePutReq("bad", { password: "newpassword123" }), { params: Promise.resolve({ id: "bad" }) });
    expect(res.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await PUT(makePutReq("u2", { password: "newpassword123" }), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/users/[id]", () => {
  it("deletes a user", async () => {
    const res = await DELETE(makeDeleteReq("u2"), { params: Promise.resolve({ id: "u2" }) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("returns 400 when trying to delete own account", async () => {
    const res = await DELETE(makeDeleteReq("u1"), { params: Promise.resolve({ id: "u1" }) });
    expect(res.status).toBe(400);
  });

  it("returns 400 when deleting last admin", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(ADMIN_USER);
    (mockDb.user.count as jest.Mock).mockResolvedValue(1);
    const res = await DELETE(makeDeleteReq("u1-other"), { params: Promise.resolve({ id: "u1-other" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 when user not found", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await DELETE(makeDeleteReq("bad"), { params: Promise.resolve({ id: "bad" }) });
    expect(res.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await DELETE(makeDeleteReq("u2"), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is OPERADOR", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "OPERADOR" } });
    const res = await DELETE(makeDeleteReq("u2"), { params: Promise.resolve({ id: "u2" }) });
    expect(res.status).toBe(403);
  });
});
