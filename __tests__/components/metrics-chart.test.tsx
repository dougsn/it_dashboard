import { render, screen } from "@testing-library/react";
import { MetricsChart } from "@/components/metrics-chart";
import type { StatusHistory } from "@prisma/client";

// Recharts uses ResizeObserver & SVG layout APIs not available in jsdom
jest.mock("recharts", () => {
  const React = require("react");
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    AreaChart: ({ children, data }: { children: React.ReactNode; data: unknown[] }) => (
      <div data-testid="area-chart" data-points={data.length}>{children}</div>
    ),
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    defs: ({ children }: { children: React.ReactNode }) => <defs>{children}</defs>,
    linearGradient: ({ children }: { children: React.ReactNode }) => <linearGradient>{children}</linearGradient>,
    stop: () => null,
  };
});

const makeHistory = (overrides: Partial<StatusHistory>[] = []): StatusHistory[] =>
  overrides.map((o, i) => ({
    id: `h-${i}`,
    deviceId: "device-1",
    isOnline: true,
    pingMs: null,
    httpOk: null,
    uptime: null,
    cpuLoad: null,
    memoryUsed: null,
    snmpData: null,
    unifiData: null,
    unifiError: null,
    timestamp: new Date(`2026-01-01T10:${String(i).padStart(2, "0")}:00`),
    ...o,
  }));

describe("MetricsChart", () => {
  it("renders the label", () => {
    render(
      <MetricsChart
        history={makeHistory([{ pingMs: 10 }, { pingMs: 20 }])}
        metric="pingMs"
        label="Latência (ms)"
      />
    );
    expect(screen.getByText("Latência (ms)")).toBeInTheDocument();
  });

  it("renders chart container", () => {
    render(
      <MetricsChart
        history={makeHistory([{ cpuLoad: 30 }, { cpuLoad: 50 }])}
        metric="cpuLoad"
        label="CPU"
      />
    );
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("passes correct number of data points to AreaChart", () => {
    const history = makeHistory([{ pingMs: 5 }, { pingMs: 10 }, { pingMs: 15 }]);
    render(<MetricsChart history={history} metric="pingMs" label="Ping" />);
    const chart = screen.getByTestId("area-chart");
    expect(chart.getAttribute("data-points")).toBe("3");
  });

  it("renders with empty history without crashing", () => {
    render(<MetricsChart history={[]} metric="pingMs" label="Ping" />);
    expect(screen.getByText("Ping")).toBeInTheDocument();
  });

  it("renders all chart sub-components", () => {
    render(
      <MetricsChart
        history={makeHistory([{ pingMs: 10 }])}
        metric="pingMs"
        label="Latência"
      />
    );
    expect(screen.getByTestId("area")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });
});
