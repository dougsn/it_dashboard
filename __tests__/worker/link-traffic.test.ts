/**
 * @jest-environment node
 */

jest.mock("routeros", () => ({
  RouterOSAPI: jest.fn(),
}));

import { RouterOSAPI } from "routeros";
import { checkLinkTraffic } from "@/worker/monitors/link-traffic";

const MockRouterOSAPI = RouterOSAPI as jest.MockedClass<typeof RouterOSAPI>;

let mockConnect: jest.Mock;
let mockClose: jest.Mock;
let mockWrite: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();

  mockConnect = jest.fn().mockResolvedValue(undefined);
  mockClose   = jest.fn();
  mockWrite   = jest.fn();

  MockRouterOSAPI.mockImplementation(() => ({
    connect: mockConnect,
    close:   mockClose,
    write:   mockWrite,
  }) as unknown as InstanceType<typeof RouterOSAPI>);
});

afterEach(() => {
  jest.useRealTimers();
});

function makeSample(rx: number, tx: number) {
  return [{ name: "ether1", "rx-byte": String(rx), "tx-byte": String(tx) }];
}

describe("checkLinkTraffic", () => {
  it("calculates downloadBps and uploadBps from byte delta", async () => {
    // before: rx=1000, tx=500 / after: rx=2000, tx=1500
    // delta rx = 1000 bytes → 8000 bits/s; delta tx = 1000 bytes → 8000 bits/s
    mockWrite
      .mockResolvedValueOnce(makeSample(1000, 500))
      .mockResolvedValueOnce(makeSample(2000, 1500));

    const resultPromise = checkLinkTraffic("192.168.1.1", "admin", "pass", 8728, "ether1");
    await jest.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.downloadBps).toBe(8000);
    expect(result.uploadBps).toBe(8000);
  });

  it("returns 0 when counters decrease (counter reset protection)", async () => {
    mockWrite
      .mockResolvedValueOnce(makeSample(5000, 5000))
      .mockResolvedValueOnce(makeSample(100, 100)); // counter reset

    const resultPromise = checkLinkTraffic("192.168.1.1", "admin", "pass", 8728, "ether1");
    await jest.runAllTimersAsync();
    const result = await resultPromise;

    expect(result.downloadBps).toBe(0);
    expect(result.uploadBps).toBe(0);
  });

  it("throws when the interface is not found on the device", async () => {
    // Error is thrown on the first readCounters() call, before the sleep timer fires
    mockWrite.mockResolvedValue([{ name: "ether2", "rx-byte": "0", "tx-byte": "0" }]);

    await expect(
      checkLinkTraffic("192.168.1.1", "admin", "pass", 8728, "ether1")
    ).rejects.toThrow("ether1");
  });

  it("closes the connection after a successful call", async () => {
    mockWrite
      .mockResolvedValueOnce(makeSample(0, 0))
      .mockResolvedValueOnce(makeSample(100, 100));

    const resultPromise = checkLinkTraffic("192.168.1.1", "admin", "pass", 8728, "ether1");
    await jest.runAllTimersAsync();
    await resultPromise;

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("closes the connection even when an error is thrown inside the try block (finally)", async () => {
    // Interface not found throws inside readCounters(), which is inside the try block.
    // The finally clause must still call close().
    mockWrite.mockResolvedValue([{ name: "ether2", "rx-byte": "0", "tx-byte": "0" }]);

    await expect(
      checkLinkTraffic("192.168.1.1", "admin", "pass", 8728, "ether1")
    ).rejects.toThrow("ether1");

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("reads interface counters twice separated by the 1-second interval", async () => {
    mockWrite
      .mockResolvedValueOnce(makeSample(0, 0))
      .mockResolvedValueOnce(makeSample(125000, 62500));

    const resultPromise = checkLinkTraffic("192.168.1.1", "admin", "pass", 8728, "ether1");
    await jest.runAllTimersAsync();
    await resultPromise;

    expect(mockWrite).toHaveBeenCalledTimes(2);
  });
});
