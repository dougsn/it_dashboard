import { render, screen } from "@testing-library/react";
import { DeviceCard } from "@/components/device-card";

jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "Link";
  return MockLink;
});

const baseDevice = {
  id: "device-1",
  name: "Router Matriz",
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
  routerosUser: null,
  routerosPass: null,
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
  omadaEnabled:         false,
  omadaClientIdEnc:     null,
  omadaClientSecretEnc: null,
  omadacId:             null,
  omadaSite:            null,
  omadaSiteId:          null,
  omadaTlsVerify:       true,
  omadaControllerIp:    null,
  checkInterval: 60,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("DeviceCard", () => {
  it("renders device name and IP", () => {
    render(<DeviceCard device={{ ...baseDevice, currentStatus: null }} />);

    expect(screen.getByText("Router Matriz")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
  });

  it("renders location when provided", () => {
    render(<DeviceCard device={{ ...baseDevice, currentStatus: null }} />);
    expect(screen.getByText("Sala de Servidores")).toBeInTheDocument();
  });

  it("renders 'Online' badge when device is online", () => {
    render(
      <DeviceCard
        device={{
          ...baseDevice,
          currentStatus: {
            id: "s1",
            deviceId: "device-1",
            isOnline: true,
            pingMs: 5,
            httpOk: null,
            uptime: null,
            cpuLoad: null,
            memoryUsed: null,
            unifiData: null,
            unifiError: null,
            omadaData: null,
            omadaError: null,
            checkedAt: new Date(),
          },
        }}
      />
    );
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders 'Offline' badge when device is offline", () => {
    render(
      <DeviceCard
        device={{
          ...baseDevice,
          currentStatus: {
            id: "s1",
            deviceId: "device-1",
            isOnline: false,
            pingMs: null,
            httpOk: null,
            uptime: null,
            cpuLoad: null,
            memoryUsed: null,
            unifiData: null,
            unifiError: null,
            omadaData: null,
            omadaError: null,
            checkedAt: new Date(),
          },
        }}
      />
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("renders CPU usage when cpuLoad is available", () => {
    render(
      <DeviceCard
        device={{
          ...baseDevice,
          currentStatus: {
            id: "s1",
            deviceId: "device-1",
            isOnline: true,
            pingMs: null,
            httpOk: null,
            uptime: null,
            cpuLoad: 42.5,
            memoryUsed: null,
            unifiData: null,
            unifiError: null,
            omadaData: null,
            omadaError: null,
            checkedAt: new Date(),
          },
        }}
      />
    );
    expect(screen.getByText("42.5%")).toBeInTheDocument();
  });

  it("renders uptime when available", () => {
    render(
      <DeviceCard
        device={{
          ...baseDevice,
          currentStatus: {
            id: "s1",
            deviceId: "device-1",
            isOnline: true,
            pingMs: null,
            httpOk: null,
            uptime: 3600,
            cpuLoad: null,
            memoryUsed: null,
            unifiData: null,
            unifiError: null,
            omadaData: null,
            omadaError: null,
            checkedAt: new Date(),
          },
        }}
      />
    );
    expect(screen.getByText("1h 0m")).toBeInTheDocument();
  });

  it("links to device detail page", () => {
    render(<DeviceCard device={{ ...baseDevice, currentStatus: null }} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/devices/device-1");
  });

  it("shows ping response time when available", () => {
    render(
      <DeviceCard
        device={{
          ...baseDevice,
          currentStatus: {
            id: "s1",
            deviceId: "device-1",
            isOnline: true,
            pingMs: 15,
            httpOk: null,
            uptime: null,
            cpuLoad: null,
            memoryUsed: null,
            unifiData: null,
            unifiError: null,
            omadaData: null,
            omadaError: null,
            checkedAt: new Date(),
          },
        }}
      />
    );
    expect(screen.getByText("15ms")).toBeInTheDocument();
  });
});
