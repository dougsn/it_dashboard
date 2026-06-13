/**
 * @jest-environment node
 */

// Set webhook secret before module imports so generateWebhookToken works
process.env.WEBHOOK_SECRET = "links-test-secret-at-least-32chars!!";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/db", () => ({
  db: {
    link: {
      findMany:   jest.fn(),
      findUnique: jest.fn(),
      create:     jest.fn(),
      update:     jest.fn(),
      delete:     jest.fn(),
      count:      jest.fn(),
    },
  },
}));

import { NextRequest } from "next/server";
import { GET as listLinks, POST as createLink } from "@/app/api/links/route";
import {
  GET    as getLink,
  PUT    as updateLink,
  DELETE as deleteLink,
} from "@/app/api/links/[id]/route";
import { auth } from "@/lib/auth";
import { db }   from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb   = db   as jest.Mocked<typeof db>;

const SESSION = { user: { id: "u1", name: "admin", role: "ADMIN" }, expires: "2099-01-01" };
const LINK_ID = "link-test-001";

const fakeLink = {
  id: LINK_ID, name: "Fibra SP", description: null, location: "São Paulo",
  isOnline: true, lastEventAt: null, mikrotikDeviceId: null, mikrotikInterface: null,
  contractedDownloadBps: null, contractedUploadBps: null,
  downloadBps: null, uploadBps: null, latencyMs: null,
  createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01"),
};

function makeReq(url: string, init?: { method?: string; body?: string }) {
  return new NextRequest(url, init);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(SESSION as never);
});

// ─── GET /api/links ────────────────────────────────────────────────────────────

const listLinksReq = () => makeReq("http://localhost/api/links");

describe("GET /api/links", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await listLinks(listLinksReq());
    expect(res.status).toBe(401);
  });

  it("returns list with webhookToken added to each link", async () => {
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([
      { ...fakeLink, _count: { events: 3 } },
    ]);

    const res = await listLinks(listLinksReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].webhookToken).toMatch(/^[0-9a-f]{64}$/);
    expect(body[0].id).toBe(LINK_ID);
  });

  it("returns empty array when no links exist", async () => {
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([]);
    const res = await listLinks(listLinksReq());
    expect(await res.json()).toHaveLength(0);
  });
});

// ─── POST /api/links ───────────────────────────────────────────────────────────

describe("POST /api/links", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await createLink(
      makeReq("http://localhost/api/links", {
        method: "POST",
        body: JSON.stringify({ name: "Link A" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("creates a link with valid body and returns 201", async () => {
    (mockDb.link.create as jest.Mock).mockResolvedValue(fakeLink);

    const res = await createLink(
      makeReq("http://localhost/api/links", {
        method: "POST",
        body: JSON.stringify({ name: "Fibra SP", location: "São Paulo" }),
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe(LINK_ID);
    expect(mockDb.link.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "Fibra SP" }) })
    );
  });

  it("returns 400 when name is missing", async () => {
    const res = await createLink(
      makeReq("http://localhost/api/links", {
        method: "POST",
        body: JSON.stringify({ location: "SP" }),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when name exceeds 100 characters", async () => {
    const res = await createLink(
      makeReq("http://localhost/api/links", {
        method: "POST",
        body: JSON.stringify({ name: "a".repeat(101) }),
      })
    );
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/links/[id] ───────────────────────────────────────────────────────

describe("GET /api/links/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await getLink(makeReq(`http://localhost/api/links/${LINK_ID}`), makeParams(LINK_ID));
    expect(res.status).toBe(401);
  });

  it("returns the link when found", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(fakeLink);
    const res = await getLink(makeReq(`http://localhost/api/links/${LINK_ID}`), makeParams(LINK_ID));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(LINK_ID);
  });

  it("returns 404 when link does not exist", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await getLink(makeReq(`http://localhost/api/links/${LINK_ID}`), makeParams(LINK_ID));
    expect(res.status).toBe(404);
  });
});

// ─── PUT /api/links/[id] ───────────────────────────────────────────────────────

describe("PUT /api/links/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await updateLink(
      makeReq(`http://localhost/api/links/${LINK_ID}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Updated" }),
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(401);
  });

  it("updates and returns the link with valid body", async () => {
    const updated = { ...fakeLink, name: "Fibra SP v2" };
    (mockDb.link.update as jest.Mock).mockResolvedValue(updated);

    const res = await updateLink(
      makeReq(`http://localhost/api/links/${LINK_ID}`, {
        method: "PUT",
        body: JSON.stringify({ name: "Fibra SP v2" }),
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("Fibra SP v2");
  });

  it("returns 400 when body fails validation", async () => {
    const res = await updateLink(
      makeReq(`http://localhost/api/links/${LINK_ID}`, {
        method: "PUT",
        body: JSON.stringify({ name: "a".repeat(101) }),
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/links/[id] ───────────────────────────────────────────────────

describe("DELETE /api/links/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await deleteLink(
      makeReq(`http://localhost/api/links/${LINK_ID}`, { method: "DELETE" }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(401);
  });

  it("deletes the link and returns 204", async () => {
    (mockDb.link.delete as jest.Mock).mockResolvedValue({});
    const res = await deleteLink(
      makeReq(`http://localhost/api/links/${LINK_ID}`, { method: "DELETE" }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(204);
    expect(mockDb.link.delete).toHaveBeenCalledWith({ where: { id: LINK_ID } });
  });
});
