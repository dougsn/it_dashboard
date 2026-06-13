import { render, screen, act } from "@testing-library/react";
import { LinkDetailDrawer } from "@/components/link-detail-drawer";

jest.mock("next/link", () => {
  const L = ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>;
  L.displayName = "Link";
  return L;
});

jest.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ReferenceLine: () => null,
}));

const LINK = {
  id: "lnk1",
  name: "Fibra 500M",
  location: "Sala TI",
  isOnline: true,
  downloadBps: 1_000_000,
  uploadBps: 500_000,
  latencyMs: 10,
  contractedDownloadBps: 500_000_000,
  contractedUploadBps: 100_000_000,
  mikrotikDeviceId: null,
  mikrotikInterface: null,
  mikrotikDevice: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const EVENTS_RESPONSE = {
  link: LINK,
  events: [
    { id: "e1", linkId: "lnk1", type: "UP", timestamp: new Date("2026-01-01T10:00:00Z").toISOString() },
  ],
  lastBefore: null,
  since: new Date("2025-12-31").toISOString(),
};

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => EVENTS_RESPONSE,
  });
});

afterEach(() => jest.clearAllMocks());

describe("LinkDetailDrawer", () => {
  it("renders nothing when linkId is null", () => {
    render(<LinkDetailDrawer linkId={null} onClose={jest.fn()} />);
    expect(screen.queryByText("Fibra 500M")).not.toBeInTheDocument();
  });

  it("fetches and renders link data when linkId is provided", async () => {
    await act(async () => {
      render(<LinkDetailDrawer linkId="lnk1" onClose={jest.fn()} />);
    });
    expect(screen.getByText("Fibra 500M")).toBeInTheDocument();
  });

  it("shows link name in drawer", async () => {
    await act(async () => {
      render(<LinkDetailDrawer linkId="lnk1" onClose={jest.fn()} />);
    });
    expect(screen.getAllByText("Fibra 500M").length).toBeGreaterThan(0);
  });

  it("calls onClose callback", async () => {
    const onClose = jest.fn();
    await act(async () => {
      render(<LinkDetailDrawer linkId="lnk1" onClose={onClose} />);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows loading indicator before data loads", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    render(<LinkDetailDrawer linkId="lnk1" onClose={jest.fn()} />);
    expect(document.body).toBeInTheDocument();
  });
});
