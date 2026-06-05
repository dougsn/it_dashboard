/**
 * @jest-environment node
 */
import { POST } from "@/app/api/devices/bulk/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: {
      createMany: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;

const FAKE_SESSION = { user: { id: "user-1", name: "admin" }, expires: "2099-01-01" };

const BASE_PAYLOAD = {
  name: "Camera",
  ipStart: "192.168.1.100",
  ipEnd: "192.168.1.103",
  type: "CAMERA",
};

beforeEach(() => {
  jest.clearAllMocks();
});

function makeReq(body: object) {
  return new NextRequest("http://localhost/api/devices/bulk", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/devices/bulk", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await POST(makeReq(BASE_PAYLOAD));
    expect(res.status).toBe(401);
  });

  it("creates devices and returns 201 with count", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.createMany as jest.Mock).mockResolvedValue({ count: 4 });

    const res = await POST(makeReq(BASE_PAYLOAD));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.created).toBe(4);
    expect(data.ips).toHaveLength(4);
  });

  it("names each device with the last IP octet as suffix", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.createMany as jest.Mock).mockResolvedValue({ count: 4 });

    await POST(makeReq(BASE_PAYLOAD));

    const callData = (mockDb.device.createMany as jest.Mock).mock.calls[0][0].data as Array<{ name: string; ip: string }>;
    expect(callData[0].name).toBe("Camera 100");
    expect(callData[0].ip).toBe("192.168.1.100");
    expect(callData[3].name).toBe("Camera 103");
    expect(callData[3].ip).toBe("192.168.1.103");
  });

  it("returns 400 when ipStart > ipEnd", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const res = await POST(makeReq({ ...BASE_PAYLOAD, ipStart: "192.168.1.200", ipEnd: "192.168.1.100" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when range exceeds 254 devices", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const res = await POST(makeReq({ ...BASE_PAYLOAD, ipStart: "10.0.0.1", ipEnd: "10.0.1.10" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/254/);
  });

  it("returns 400 for invalid IP format", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const res = await POST(makeReq({ ...BASE_PAYLOAD, ipStart: "not-an-ip" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when checkInterval is below minimum (10)", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const res = await POST(makeReq({ ...BASE_PAYLOAD, checkInterval: 5 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid device type", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    const res = await POST(makeReq({ ...BASE_PAYLOAD, type: "PRINTER" }));
    expect(res.status).toBe(400);
  });
});
