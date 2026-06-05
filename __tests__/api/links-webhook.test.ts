/**
 * @jest-environment node
 */
import { GET as upGET, POST as upPOST } from "@/app/api/links/[id]/up/route";
import { GET as downGET, POST as downPOST } from "@/app/api/links/[id]/down/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/webhook", () => ({
  verifyWebhookToken: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    link: { findUnique: jest.fn(), update: jest.fn() },
    linkEvent: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { verifyWebhookToken } from "@/lib/webhook";
import { db } from "@/lib/db";

const mockVerify = verifyWebhookToken as jest.MockedFunction<typeof verifyWebhookToken>;
const mockDb = db as jest.Mocked<typeof db>;

const FAKE_PARAMS = (id: string) => Promise.resolve({ id });

const LINK_OFFLINE = { id: "link-1", isOnline: false, name: "Link SP" };
const LINK_ONLINE  = { id: "link-1", isOnline: true,  name: "Link SP" };

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.$transaction as jest.Mock).mockResolvedValue([{}, {}]);
});

// ── /up ───────────────────────────────────────────────────────────────────────

describe("POST /api/links/:id/up", () => {
  it("returns 401 when token is missing", async () => {
    mockVerify.mockReturnValue(false);
    const req = new NextRequest("http://localhost/api/links/link-1/up", { method: "POST" });
    const res = await upPOST(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is invalid", async () => {
    mockVerify.mockReturnValue(false);
    const req = new NextRequest("http://localhost/api/links/link-1/up?token=bad");
    const res = await upGET(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(401);
  });

  it("returns 404 when link does not exist", async () => {
    mockVerify.mockReturnValue(true);
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/links/link-1/up?token=tok");
    const res = await upGET(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(404);
  });

  it("creates UP event and sets isOnline=true when link is offline", async () => {
    mockVerify.mockReturnValue(true);
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(LINK_OFFLINE);
    const req = new NextRequest("http://localhost/api/links/link-1/up?token=tok");
    const res = await upGET(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(200);
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
    const data = await res.json();
    expect(data.status).toBe("up");
  });

  it("is idempotent — no transaction when link is already online", async () => {
    mockVerify.mockReturnValue(true);
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(LINK_ONLINE);
    const req = new NextRequest("http://localhost/api/links/link-1/up?token=tok");
    const res = await upGET(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(200);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });

  it("accepts token via x-webhook-token header", async () => {
    mockVerify.mockReturnValue(true);
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(LINK_OFFLINE);
    const req = new NextRequest("http://localhost/api/links/link-1/up", {
      method: "POST",
      headers: { "x-webhook-token": "validtoken" },
    });
    const res = await upPOST(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(200);
    expect(mockVerify).toHaveBeenCalledWith("link-1", "validtoken");
  });
});

// ── /down ─────────────────────────────────────────────────────────────────────

describe("POST /api/links/:id/down", () => {
  it("returns 401 when token is missing", async () => {
    mockVerify.mockReturnValue(false);
    const req = new NextRequest("http://localhost/api/links/link-1/down", { method: "POST" });
    const res = await downPOST(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(401);
  });

  it("returns 404 when link does not exist", async () => {
    mockVerify.mockReturnValue(true);
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/links/link-1/down?token=tok");
    const res = await downGET(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(404);
  });

  it("creates DOWN event and sets isOnline=false when link is online", async () => {
    mockVerify.mockReturnValue(true);
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(LINK_ONLINE);
    const req = new NextRequest("http://localhost/api/links/link-1/down?token=tok");
    const res = await downGET(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(200);
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
    const data = await res.json();
    expect(data.status).toBe("down");
  });

  it("is idempotent — no transaction when link is already offline", async () => {
    mockVerify.mockReturnValue(true);
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(LINK_OFFLINE);
    const req = new NextRequest("http://localhost/api/links/link-1/down?token=tok");
    const res = await downGET(req, { params: FAKE_PARAMS("link-1") });
    expect(res.status).toBe(200);
    expect(mockDb.$transaction).not.toHaveBeenCalled();
  });
});
