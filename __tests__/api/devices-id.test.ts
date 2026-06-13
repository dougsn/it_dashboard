/**
 * @jest-environment node
 */
import { GET, PUT, DELETE } from "@/app/api/devices/[id]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb = db as jest.Mocked<typeof db>;

const FAKE_SESSION = { user: { id: "user-1", name: "admin", role: "ADMIN" }, expires: "2099-01-01" };
const FAKE_PARAMS = Promise.resolve({ id: "device-1" });

const FAKE_DEVICE = {
  id: "device-1",
  name: "Router Principal",
  ip: "192.168.1.1",
  type: "MIKROTIK",
  currentStatus: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/devices/:id", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const req = new NextRequest("http://localhost/api/devices/device-1");

    const res = await GET(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(401);
  });

  it("returns 404 when device not found", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/devices/device-1");
    const res = await GET(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(404);
  });

  it("returns device when found", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue(FAKE_DEVICE);

    const req = new NextRequest("http://localhost/api/devices/device-1");
    const res = await GET(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("device-1");
  });
});

describe("PUT /api/devices/:id", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const req = new NextRequest("http://localhost/api/devices/device-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Router Atualizado" }),
    });

    const res = await PUT(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(401);
  });

  it("updates and returns device", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.update as jest.Mock).mockResolvedValue({
      ...FAKE_DEVICE,
      name: "Router Atualizado",
    });

    const req = new NextRequest("http://localhost/api/devices/device-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Router Atualizado" }),
    });

    const res = await PUT(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Router Atualizado");
  });

  it("returns 400 for invalid update payload", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const req = new NextRequest("http://localhost/api/devices/device-1", {
      method: "PUT",
      body: JSON.stringify({ type: "TIPO_INVALIDO" }),
    });

    const res = await PUT(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/devices/:id", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const req = new NextRequest("http://localhost/api/devices/device-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(401);
  });

  it("deletes device and returns 204", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    (mockDb.device.delete as jest.Mock).mockResolvedValue(FAKE_DEVICE);

    const req = new NextRequest("http://localhost/api/devices/device-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: FAKE_PARAMS });
    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });
});
