/**
 * @jest-environment node
 */
import { GET, POST } from "@/app/api/devices/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;

const FAKE_SESSION = { user: { id: "user-1", name: "admin", role: "ADMIN" }, expires: "2099-01-01" };

const FAKE_DEVICE = {
  id: "device-1",
  name: "Router Principal",
  ip: "192.168.1.1",
  type: "MIKROTIK" as const,
  location: "Sala de Servidores",
  notes: null,
  pingEnabled: true,
  httpEnabled: false,
  httpPort: null,
  httpPath: "/",
  snmpEnabled: false,
  snmpCommunity: "public",
  snmpPort: 161,
  routerosEnabled: false,
  routerosUserEnc: null,
  routerosPassEnc: null,
  routerosPort: 8728,
  unifiEnabled: false,
  unifiAuthMethod: "apikey",
  unifiApiKeyEnc: null,
  unifiUserEnc: null,
  unifiPassEnc: null,
  unifiPort: 443,
  unifiSite: "default",
  unifiTlsVerify: false,
  unifiControllerIp: null,
  checkInterval: 60,
  createdAt: new Date(),
  updatedAt: new Date(),
  currentStatus: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/devices", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET(new NextRequest("http://localhost/api/devices"));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns devices list when authenticated", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([FAKE_DEVICE]);

    const res = await GET(new NextRequest("http://localhost/api/devices"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Router Principal");
  });

  it("includes currentStatus in result", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([
      { ...FAKE_DEVICE, currentStatus: { isOnline: true, pingMs: 5 } },
    ]);

    const res = await GET(new NextRequest("http://localhost/api/devices"));
    const data = await res.json();
    expect(data[0].currentStatus.isOnline).toBe(true);
  });
});

describe("POST /api/devices", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ name: "Router", ip: "10.0.0.1", type: "MIKROTIK" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates device and returns 201 with valid payload", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.create as jest.Mock).mockResolvedValue(FAKE_DEVICE);

    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ name: "Router Principal", ip: "192.168.1.1", type: "MIKROTIK" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("Router Principal");
  });

  it("returns 400 for missing required fields", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ ip: "192.168.1.1" }), // missing name and type
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid device type", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ name: "Test", ip: "10.0.0.1", type: "INVALID_TYPE" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
