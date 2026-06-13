import { render, screen } from "@testing-library/react";
import { PingChart } from "@/components/ping-chart";
import type { StatusHistory } from "@prisma/client";

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
  };
});

const makeEntry = (overrides: Partial<StatusHistory>): StatusHistory => ({
  id: "h-1",
  deviceId: "device-1",
  isOnline: true,
  pingMs: null,
  cpuLoad: null,
  memoryUsed: null,
  timestamp: new Date("2026-01-01T10:00:00"),
  ...overrides,
});

describe("PingChart", () => {
  it("returns null when history has fewer than 2 entries", () => {
    const { container } = render(
      <PingChart history={[makeEntry({ pingMs: 10 })]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders chart when history has 2+ entries", () => {
    render(
      <PingChart
        history={[
          makeEntry({ pingMs: 10 }),
          makeEntry({ pingMs: 20, id: "h-2" }),
        ]}
      />
    );
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("passes correct number of data points", () => {
    const history = [
      makeEntry({ pingMs: 5 }),
      makeEntry({ pingMs: 10, id: "h-2" }),
      makeEntry({ pingMs: 15, id: "h-3" }),
    ];
    render(<PingChart history={history} />);
    const chart = screen.getByTestId("area-chart");
    expect(chart.getAttribute("data-points")).toBe("3");
  });

  it("renders with offline entries without crashing", () => {
    render(
      <PingChart
        history={[
          makeEntry({ isOnline: false, pingMs: null }),
          makeEntry({ isOnline: true, pingMs: 20, id: "h-2" }),
        ]}
      />
    );
    expect(screen.getByTestId("area")).toBeInTheDocument();
  });

  it("renders all chart sub-components", () => {
    render(
      <PingChart
        history={[
          makeEntry({ pingMs: 10 }),
          makeEntry({ pingMs: 20, id: "h-2" }),
        ]}
      />
    );
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });
});
