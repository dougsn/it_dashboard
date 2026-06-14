import {
  formatUptime,
  formatResponseTime,
  formatPercent,
  formatBps,
  formatBytes,
  formatDuration,
  timeAgo,
} from "@/lib/format";

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

describe("formatBps", () => {
  it("returns '—' for null", () => {
    expect(formatBps(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatBps(undefined)).toBe("—");
  });

  it("formats sub-kbps as raw bps", () => {
    expect(formatBps(500)).toBe("500 bps");
  });

  it("formats kbps range", () => {
    expect(formatBps(1_000)).toBe("1 Kbps");
    expect(formatBps(500_000)).toBe("500 Kbps");
  });

  it("formats mbps range", () => {
    expect(formatBps(1_000_000)).toBe("1.0 Mbps");
    expect(formatBps(100_000_000)).toBe("100.0 Mbps");
  });

  it("formats gbps range", () => {
    expect(formatBps(1_000_000_000)).toBe("1.0 Gbps");
    expect(formatBps(10_000_000_000)).toBe("10.0 Gbps");
  });
});

describe("formatBytes", () => {
  it("returns '—' for null, undefined and zero", () => {
    expect(formatBytes(null)).toBe("—");
    expect(formatBytes(undefined)).toBe("—");
    expect(formatBytes(0)).toBe("—");
  });

  it("formats bytes, KB, MB and GB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2_048)).toBe("2.0 KB");
    expect(formatBytes(5_242_880)).toBe("5.0 MB");
    expect(formatBytes(2_147_483_648)).toBe("2.00 GB");
  });
});

describe("formatDuration", () => {
  it("returns '—' for null", () => {
    expect(formatDuration(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatDuration(undefined)).toBe("—");
  });

  it("formats sub-minute as seconds", () => {
    expect(formatDuration(30_000)).toBe("30s");
    expect(formatDuration(0)).toBe("0s");
  });

  it("formats minutes range", () => {
    expect(formatDuration(60_000)).toBe("1min");
    expect(formatDuration(3_540_000)).toBe("59min");
  });

  it("formats hours without remainder", () => {
    expect(formatDuration(3_600_000)).toBe("1h");
    expect(formatDuration(7_200_000)).toBe("2h");
  });

  it("formats hours with remaining minutes", () => {
    expect(formatDuration(3_660_000)).toBe("1h 1min");
    expect(formatDuration(7_320_000)).toBe("2h 2min");
  });
});

describe("timeAgo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 'agora' for timestamps less than 1 minute ago", () => {
    const iso = new Date("2026-01-01T11:59:30.000Z").toISOString();
    expect(timeAgo(iso)).toBe("agora");
  });

  it("returns minutes for timestamps under 1 hour", () => {
    const iso = new Date("2026-01-01T11:55:00.000Z").toISOString();
    expect(timeAgo(iso)).toBe("há 5min");
  });

  it("returns hours for timestamps under 24 hours", () => {
    const iso = new Date("2026-01-01T09:00:00.000Z").toISOString();
    expect(timeAgo(iso)).toBe("há 3h");
  });

  it("returns days for timestamps over 24 hours", () => {
    const iso = new Date("2025-12-30T12:00:00.000Z").toISOString();
    expect(timeAgo(iso)).toBe("há 2d");
  });
});
