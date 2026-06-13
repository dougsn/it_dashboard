import { render, screen } from "@testing-library/react";
import { ReportView } from "@/components/report-view";
import type { DeviceReport } from "@/app/api/reports/route";

jest.mock("next/link", () => {
  const L = ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>;
  L.displayName = "Link";
  return L;
});

// Mock recharts to avoid canvas rendering issues in jsdom
jest.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Legend: () => null,
}));

const REPORT: DeviceReport = {
  device: { id: "dev1", name: "Router HQ", type: "MIKROTIK", ip: "192.168.1.1", location: "Sala TI" },
  period: {
    from: new Date("2026-01-01T00:00:00Z").toISOString(),
    to: new Date("2026-01-08T00:00:00Z").toISOString(),
    hours: 168,
  },
  summary: {
    uptimePct: 100,
    totalChecks: 2,
    onlineChecks: 2,
    incidentCount: 0,
    totalDowntimeMs: 0,
    avgPingMs: 5.5,
    maxPingMs: 6,
    minPingMs: 5,
  },
  insights: [],
  pingHistory: [
    { timestamp: new Date("2026-01-01T10:00:00Z").toISOString(), isOnline: true, pingMs: 5 },
    { timestamp: new Date("2026-01-01T10:01:00Z").toISOString(), isOnline: true, pingMs: 6 },
  ],
  incidents: [],
  routerosHistory: null,
  unifiSnapshot: null,
  omadaSnapshot: null,
};

describe("ReportView", () => {
  it("renders report for a single device", () => {
    render(<ReportView reports={[REPORT]} generatedAt={new Date()} />);
    expect(screen.getByText("Router HQ")).toBeInTheDocument();
  });

  it("renders report header with correct device count for multiple devices", () => {
    const REPORT2: DeviceReport = { ...REPORT, device: { ...REPORT.device, id: "dev2", name: "Switch" } };
    render(<ReportView reports={[REPORT, REPORT2]} generatedAt={new Date()} />);
    expect(screen.getByText(/2 dispositivos/i)).toBeInTheDocument();
  });

  it("renders uptime percentage", () => {
    render(<ReportView reports={[REPORT]} generatedAt={new Date()} />);
    expect(screen.getByText("100.00%")).toBeInTheDocument();
  });

  it("renders insights section when insights exist", () => {
    const reportWithInsight: DeviceReport = {
      ...REPORT,
      insights: [{ level: "warn", text: "Latência acima do normal" }],
    };
    render(<ReportView reports={[reportWithInsight]} generatedAt={new Date()} />);
    expect(screen.getByText(/latência acima/i)).toBeInTheDocument();
  });

  it("renders correctly with showClients=false", () => {
    render(<ReportView reports={[REPORT]} generatedAt={new Date()} showClients={false} />);
    expect(screen.getByText("Router HQ")).toBeInTheDocument();
  });
});
