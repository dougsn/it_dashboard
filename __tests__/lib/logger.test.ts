/**
 * @jest-environment node
 */
import { log } from "@/lib/logger";

describe("log()", () => {
  let spyLog: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let spyError: jest.SpyInstance;

  beforeEach(() => {
    spyLog   = jest.spyOn(console, "log").mockImplementation(() => {});
    spyWarn  = jest.spyOn(console, "warn").mockImplementation(() => {});
    spyError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("emits JSON to console.log for level=info", () => {
    log("info", "startup complete");
    expect(spyLog).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spyLog.mock.calls[0][0] as string);
    expect(parsed.level).toBe("info");
    expect(parsed.msg).toBe("startup complete");
    expect(typeof parsed.ts).toBe("string");
  });

  it("emits JSON to console.warn for level=warn", () => {
    log("warn", "high memory usage", { pct: 92 });
    expect(spyWarn).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spyWarn.mock.calls[0][0] as string);
    expect(parsed.level).toBe("warn");
    expect(parsed.pct).toBe(92);
  });

  it("emits JSON to console.error for level=error", () => {
    log("error", "check failed", { device: "router-01", error: "timeout" });
    expect(spyError).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spyError.mock.calls[0][0] as string);
    expect(parsed.level).toBe("error");
    expect(parsed.device).toBe("router-01");
    expect(parsed.error).toBe("timeout");
  });

  it("works without a context object", () => {
    expect(() => log("info", "bare message")).not.toThrow();
    const parsed = JSON.parse(spyLog.mock.calls[0][0] as string);
    expect(parsed.msg).toBe("bare message");
  });

  it("includes a valid ISO 8601 timestamp in every entry", () => {
    log("info", "time check");
    const parsed = JSON.parse(spyLog.mock.calls[0][0] as string);
    expect(() => new Date(parsed.ts).toISOString()).not.toThrow();
  });

  it("does not call console.warn or console.error for level=info", () => {
    log("info", "info only");
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });
});
