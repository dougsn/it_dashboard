/**
 * @jest-environment node
 *
 * Integration test for the webhook UP/DOWN flow.
 *
 * Unlike the unit tests in __tests__/api/links-webhook.test.ts, this suite:
 *  - Does NOT mock lib/webhook — real HMAC-SHA256 token generation/verification runs
 *  - Implements $transaction as Promise.all so both DB operations are actually called
 *  - Verifies the atomic pair (linkEvent.create + link.update) happens for every state change
 *  - Tests token-via-header and token-via-querystring delivery paths
 */

// Set the secret BEFORE the module imports so verifyWebhookToken picks it up
process.env.WEBHOOK_SECRET = "integration-test-secret-32chars!!";

jest.mock("@/lib/db", () => ({
  db: {
    link: {
      findUnique: jest.fn(),
      update:     jest.fn(),
    },
    linkEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { POST as postDown } from "@/app/api/links/[id]/down/route";
import { POST as postUp }   from "@/app/api/links/[id]/up/route";
import { generateWebhookToken } from "@/lib/webhook";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const LINK_ID   = "link-integration-001";
const VALID_TOKEN = generateWebhookToken(LINK_ID);

const onlineLink  = { id: LINK_ID, name: "Fibra SP", isOnline: true };
const offlineLink = { id: LINK_ID, name: "Fibra SP", isOnline: false };

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: "POST", headers });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Realistic $transaction: actually executes the operations array
  (mockDb.$transaction as jest.Mock).mockImplementation(
    (ops: Promise<unknown>[]) => Promise.all(ops)
  );
  (mockDb.link.findUnique as jest.Mock).mockResolvedValue(onlineLink);
  (mockDb.link.update as jest.Mock).mockResolvedValue({});
  (mockDb.linkEvent.create as jest.Mock).mockResolvedValue({});
});

// ─── Authentication ────────────────────────────────────────────────────────────

describe("Authentication", () => {
  it("DOWN: rejects request with missing token", async () => {
    const res = await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down`),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(401);
  });

  it("DOWN: rejects request with wrong token", async () => {
    const res = await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down`, {
        "x-webhook-token": "wrong-token",
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(401);
  });

  it("DOWN: rejects token generated for a different linkId", async () => {
    const tokenForOtherLink = generateWebhookToken("other-link-id");
    const res = await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down`, {
        "x-webhook-token": tokenForOtherLink,
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(401);
  });

  it("UP: rejects request with missing token", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(offlineLink);
    const res = await postUp(
      makeReq(`http://localhost/api/links/${LINK_ID}/up`),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(401);
  });
});

// ─── DOWN webhook ─────────────────────────────────────────────────────────────

describe("DOWN webhook", () => {
  it("accepts valid token via x-webhook-token header", async () => {
    const res = await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down`, {
        "x-webhook-token": VALID_TOKEN,
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, status: "down" });
  });

  it("accepts valid token via ?token= query param", async () => {
    const res = await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down?token=${VALID_TOKEN}`),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(200);
  });

  it("creates a DOWN event AND updates link atomically when link is online", async () => {
    await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down`, {
        "x-webhook-token": VALID_TOKEN,
      }),
      makeParams(LINK_ID)
    );

    // Both operations must have been called (inside $transaction)
    expect(mockDb.linkEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "DOWN", linkId: LINK_ID }) })
    );
    expect(mockDb.link.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isOnline: false }) })
    );
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
  });

  it("does NOT create an event when link is already offline (idempotent)", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(offlineLink);

    await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down`, {
        "x-webhook-token": VALID_TOKEN,
      }),
      makeParams(LINK_ID)
    );

    expect(mockDb.$transaction).not.toHaveBeenCalled();
    expect(mockDb.linkEvent.create).not.toHaveBeenCalled();
  });

  it("returns 404 when link does not exist", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await postDown(
      makeReq(`http://localhost/api/links/${LINK_ID}/down`, {
        "x-webhook-token": VALID_TOKEN,
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(404);
  });
});

// ─── UP webhook ───────────────────────────────────────────────────────────────

describe("UP webhook", () => {
  beforeEach(() => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(offlineLink);
  });

  it("accepts valid token via x-webhook-token header", async () => {
    const res = await postUp(
      makeReq(`http://localhost/api/links/${LINK_ID}/up`, {
        "x-webhook-token": VALID_TOKEN,
      }),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, status: "up" });
  });

  it("creates an UP event AND updates link atomically when link is offline", async () => {
    await postUp(
      makeReq(`http://localhost/api/links/${LINK_ID}/up`, {
        "x-webhook-token": VALID_TOKEN,
      }),
      makeParams(LINK_ID)
    );

    expect(mockDb.linkEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "UP", linkId: LINK_ID }) })
    );
    expect(mockDb.link.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isOnline: true }) })
    );
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
  });

  it("does NOT create an event when link is already online (idempotent)", async () => {
    (mockDb.link.findUnique as jest.Mock).mockResolvedValue(onlineLink);

    await postUp(
      makeReq(`http://localhost/api/links/${LINK_ID}/up`, {
        "x-webhook-token": VALID_TOKEN,
      }),
      makeParams(LINK_ID)
    );

    expect(mockDb.$transaction).not.toHaveBeenCalled();
    expect(mockDb.linkEvent.create).not.toHaveBeenCalled();
  });

  it("header token takes priority over query param when both are present", async () => {
    const wrongToken = generateWebhookToken("other-link");
    const res = await postUp(
      makeReq(
        `http://localhost/api/links/${LINK_ID}/up?token=${wrongToken}`,
        { "x-webhook-token": VALID_TOKEN } // correct token in header
      ),
      makeParams(LINK_ID)
    );
    expect(res.status).toBe(200);
  });
});
