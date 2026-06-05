import { formatUptime, formatResponseTime, formatPercent } from "@/lib/format";

describe("formatUptime", () => {
  it("returns '—' for null", () => {
    expect(formatUptime(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatUptime(undefined)).toBe("—");
  });

  it("formats seconds under 1 hour as minutes", () => {
    expect(formatUptime(300)).toBe("5m");
    expect(formatUptime(0)).toBe("0m");
  });

  it("formats seconds between 1h and 24h as h+m", () => {
    expect(formatUptime(3660)).toBe("1h 1m");
    expect(formatUptime(7200)).toBe("2h 0m");
  });

  it("formats seconds over 1 day as d+h+m", () => {
    expect(formatUptime(90000)).toBe("1d 1h 0m");
    expect(formatUptime(172800)).toBe("2d 0h 0m");
  });

  it("accepts integer values", () => {
    expect(formatUptime(3600)).toBe("1h 0m");
  });
});

describe("formatResponseTime", () => {
  it("returns '—' for null", () => {
    expect(formatResponseTime(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatResponseTime(undefined)).toBe("—");
  });

  it("formats ms value with 'ms' suffix", () => {
    expect(formatResponseTime(42)).toBe("42ms");
    expect(formatResponseTime(0)).toBe("0ms");
    expect(formatResponseTime(1500)).toBe("1500ms");
  });
});

describe("formatPercent", () => {
  it("returns '—' for null", () => {
    expect(formatPercent(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatPercent(undefined)).toBe("—");
  });

  it("formats value with one decimal and '%' suffix", () => {
    expect(formatPercent(75.333)).toBe("75.3%");
    expect(formatPercent(100)).toBe("100.0%");
    expect(formatPercent(0)).toBe("0.0%");
  });
});
