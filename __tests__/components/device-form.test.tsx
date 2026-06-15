import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeviceForm } from "@/components/device-form";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

jest.mock("next/link", () => {
  const L = ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>;
  L.displayName = "Link";
  return L;
});

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ([]),
});

describe("DeviceForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders create form with required fields", () => {
    render(<DeviceForm />);
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endereço ip/i)).toBeInTheDocument();
  });

  it("renders with device data in edit mode", () => {
    const device = {
      id: "dev1",
      name: "Router HQ",
      ip: "192.168.1.1",
      type: "MIKROTIK" as const,
      location: "Sala TI",
      notes: "",
      pingEnabled: true,
      httpEnabled: false,
      httpPort: null,
      httpPath: "/",
      snmpEnabled: false,
      snmpCommunity: "public",
      snmpCommunityEnc: null,
      snmpPort: 161,
      routerosEnabled: true,
      routerosUserEnc: "enc",
      routerosPassEnc: "enc",
      routerosPort: 8728,
      unifiEnabled: false,
      unifiAuthMethod: "apikey" as const,
      unifiApiKeyEnc: null,
      unifiUserEnc: null,
      unifiPassEnc: null,
      unifiPort: 443,
      unifiSite: "default",
      unifiTlsVerify: false,
      unifiControllerIp: null,
      omadaEnabled: false,
      omadaClientIdEnc: null,
      omadaClientSecretEnc: null,
      omadacId: null,
      omadaSite: null,
      omadaSiteId: null,
      omadaTlsVerify: true,
      omadaControllerIp: null,
      checkInterval: 60,
      maintenanceUntil: null,
      alertWebhookUrl: null,
      alertThreshold: 3,
      lastAlertAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      hasRouterosCredentials: true,
      hasUnifiApiKey: false,
      hasUnifiCredentials: false,
      hasOmadaCredentials: false,
    };

    render(<DeviceForm device={device} />);
    expect(screen.getByDisplayValue("Router HQ")).toBeInTheDocument();
    expect(screen.getByDisplayValue("192.168.1.1")).toBeInTheDocument();
  });

  it("does NOT clobber RouterOS credentials when editing without re-entering them", async () => {
    const device = {
      id: "dev1", name: "Router HQ", ip: "192.168.1.1", type: "MIKROTIK" as const, location: "TI",
      notes: "", pingEnabled: true, httpEnabled: false, httpPort: null, httpPath: "/",
      snmpEnabled: false, snmpCommunity: "public", snmpCommunityEnc: null, snmpPort: 161,
      routerosEnabled: true, routerosUserEnc: "enc", routerosPassEnc: "enc", routerosPort: 8728,
      unifiEnabled: false, unifiAuthMethod: "apikey" as const, unifiApiKeyEnc: null,
      unifiUserEnc: null, unifiPassEnc: null, unifiPort: 443, unifiSite: "default",
      unifiTlsVerify: false, unifiControllerIp: null, omadaEnabled: false,
      omadaClientIdEnc: null, omadaClientSecretEnc: null, omadacId: null,
      omadaSite: null, omadaSiteId: null, omadaTlsVerify: true, omadaControllerIp: null,
      checkInterval: 60, maintenanceUntil: null, alertWebhookUrl: null, alertThreshold: 3, lastAlertAt: null,
      createdAt: new Date(), updatedAt: new Date(),
      hasRouterosCredentials: true, hasUnifiApiKey: false, hasUnifiCredentials: false, hasOmadaCredentials: false,
    };

    render(<DeviceForm device={device} />);
    fireEvent.click(screen.getByRole("button", { name: /atualizar/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    // Blank credentials on edit must be OMITTED (so the API preserves them), not sent as ""
    expect(body.routerosUser).toBeUndefined();
    expect(body.routerosPass).toBeUndefined();
    // Empty alert webhook must be sent as null (not "" — the server rejects "" as invalid URL)
    expect(body.alertWebhookUrl).toBeNull();
  });

  it("shows create submit button", () => {
    render(<DeviceForm />);
    expect(screen.getByRole("button", { name: /cadastrar/i })).toBeInTheDocument();
  });

  it("shows update submit button in edit mode", () => {
    const device = {
      id: "dev1", name: "R", ip: "1.2.3.4", type: "MIKROTIK" as const, location: null,
      notes: null, pingEnabled: true, httpEnabled: false, httpPort: null, httpPath: "/",
      snmpEnabled: false, snmpCommunity: "public", snmpCommunityEnc: null, snmpPort: 161,
      routerosEnabled: false, routerosUserEnc: null, routerosPassEnc: null, routerosPort: 8728,
      unifiEnabled: false, unifiAuthMethod: "apikey" as const, unifiApiKeyEnc: null,
      unifiUserEnc: null, unifiPassEnc: null, unifiPort: 443, unifiSite: "default",
      unifiTlsVerify: false, unifiControllerIp: null, omadaEnabled: false,
      omadaClientIdEnc: null, omadaClientSecretEnc: null, omadacId: null,
      omadaSite: null, omadaSiteId: null, omadaTlsVerify: true, omadaControllerIp: null,
      checkInterval: 60, maintenanceUntil: null, alertWebhookUrl: null, alertThreshold: 3, lastAlertAt: null,
      createdAt: new Date(), updatedAt: new Date(),
      hasRouterosCredentials: false, hasUnifiApiKey: false, hasUnifiCredentials: false, hasOmadaCredentials: false,
    };
    render(<DeviceForm device={device} />);
    expect(screen.getByRole("button", { name: /atualizar/i })).toBeInTheDocument();
  });
});
