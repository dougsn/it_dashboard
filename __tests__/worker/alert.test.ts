/**
 * @jest-environment node
 */
import { isCooldownActive, sendAlert } from "@/worker/monitors/alert";
import type { AlertPayload } from "@/worker/monitors/alert";

const PAYLOAD: AlertPayload = {
  deviceId: "dev1",
  deviceName: "Router",
  deviceIp: "10.0.0.1",
  deviceType: "MIKROTIK",
  failCount: 5,
  timestamp: new Date().toISOString(),
};

describe("isCooldownActive", () => {
  it("returns false when lastAlertAt is null", () => {
    expect(isCooldownActive(null)).toBe(false);
  });

  it("returns true when last alert was less than 1 hour ago", () => {
    const recent = new Date(Date.now() - 30 * 60_000); // 30 minutes ago
    expect(isCooldownActive(recent)).toBe(true);
  });

  it("returns false when last alert was more than 1 hour ago", () => {
    const old = new Date(Date.now() - 61 * 60_000); // 61 minutes ago
    expect(isCooldownActive(old)).toBe(false);
  });

  it("returns true at exactly 59 minutes", () => {
    const borderline = new Date(Date.now() - 59 * 60_000);
    expect(isCooldownActive(borderline)).toBe(true);
  });
});

describe("sendAlert", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POSTs JSON payload to the webhook URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await sendAlert("https://hooks.example.com/webhook", PAYLOAD);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://hooks.example.com/webhook",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(PAYLOAD),
      })
    );
  });

  it("throws when webhook returns non-ok response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    await expect(sendAlert("https://hooks.example.com/webhook", PAYLOAD)).rejects.toThrow(
      "HTTP 500"
    );
  });

  it("throws when fetch rejects (network error)", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network failure"));

    await expect(sendAlert("https://hooks.example.com/webhook", PAYLOAD)).rejects.toThrow(
      "network failure"
    );
  });

  it("sends all payload fields", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    await sendAlert("https://hooks.example.com/webhook", PAYLOAD);

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.deviceId).toBe("dev1");
    expect(body.deviceName).toBe("Router");
    expect(body.failCount).toBe(5);
  });
});
