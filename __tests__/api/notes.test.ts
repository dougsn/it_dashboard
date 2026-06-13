/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/notes/route";
import { GET as noteGET, PUT, DELETE } from "@/app/api/notes/[id]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    note: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const note = (db as any).note as Record<string, jest.Mock>;

const FAKE_SESSION = { user: { id: "user-1", name: "admin", role: "ADMIN" }, expires: "2099-01-01" };
const FAKE_PARAMS = Promise.resolve({ id: "note-1" });

const FAKE_NOTE = {
  id: "note-1",
  title: "JWT Secret Hardcoded",
  content: "O secret JWT usa 'dev-secret' como fallback.",
  severity: "CRITICAL",
  category: "SECURITY",
  status: "OPEN",
  deviceId: null,
  device: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  resolvedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/notes", () => {
  const makeGetReq = (url = "http://localhost/api/notes") =>
    new NextRequest(url);

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(makeGetReq());
    expect(res.status).toBe(401);
  });

  it("returns notes list when authenticated", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    note.findMany.mockResolvedValue([FAKE_NOTE]);

    const res = await GET(makeGetReq());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].severity).toBe("CRITICAL");
  });
});

describe("POST /api/notes", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const req = new NextRequest("http://localhost/api/notes", {
      method: "POST",
      body: JSON.stringify({ title: "Test", content: "Content" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates note and returns 201", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    note.create.mockResolvedValue(FAKE_NOTE);

    const req = new NextRequest("http://localhost/api/notes", {
      method: "POST",
      body: JSON.stringify({
        title: "JWT Secret Hardcoded",
        content: "O secret JWT usa dev-secret como fallback.",
        severity: "CRITICAL",
        category: "SECURITY",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.severity).toBe("CRITICAL");
  });

  it("returns 400 for missing title", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const req = new NextRequest("http://localhost/api/notes", {
      method: "POST",
      body: JSON.stringify({ content: "Only content, no title" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid severity", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const req = new NextRequest("http://localhost/api/notes", {
      method: "POST",
      body: JSON.stringify({ title: "Test", content: "Content", severity: "ULTRA" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/notes/:id", () => {
  it("returns 401 without session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const req = new NextRequest("http://localhost/api/notes/note-1");
    const res = await noteGET(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not found", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    note.findUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/notes/note-1");
    const res = await noteGET(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/notes/:id", () => {
  it("auto-sets resolvedAt when status changes to RESOLVED", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    note.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ ...FAKE_NOTE, ...data })
    );

    const req = new NextRequest("http://localhost/api/notes/note-1", {
      method: "PUT",
      body: JSON.stringify({ status: "RESOLVED" }),
    });

    const res = await PUT(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(200);

    const updateCall = note.update.mock.calls[0][0];
    expect(updateCall.data.resolvedAt).not.toBeNull();
  });

  it("clears resolvedAt when reopening a note", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    note.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ ...FAKE_NOTE, ...data })
    );

    const req = new NextRequest("http://localhost/api/notes/note-1", {
      method: "PUT",
      body: JSON.stringify({ status: "OPEN" }),
    });

    await PUT(req, { params: FAKE_PARAMS });

    const updateCall = note.update.mock.calls[0][0];
    expect(updateCall.data.resolvedAt).toBeNull();
  });
});

describe("DELETE /api/notes/:id", () => {
  it("returns 401 without session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const req = new NextRequest("http://localhost/api/notes/note-1", { method: "DELETE" });
    const res = await DELETE(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(401);
  });

  it("deletes and returns 204", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    note.delete.mockResolvedValue(FAKE_NOTE);
    const req = new NextRequest("http://localhost/api/notes/note-1", { method: "DELETE" });
    const res = await DELETE(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(204);
  });
});
