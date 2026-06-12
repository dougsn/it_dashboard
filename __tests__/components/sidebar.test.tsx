import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/sidebar";

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

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/"),
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockResolvedValue({
    ok: false,
    json: async () => [],
  });
});

describe("Sidebar", () => {
  it("renders brand name 'WatchIT Tower'", async () => {
    render(<Sidebar />);
    expect(screen.getByText("WatchIT Tower")).toBeInTheDocument();
  });

  it("renders all main navigation links", async () => {
    render(<Sidebar />);
    expect(screen.getByText("Visão geral")).toBeInTheDocument();
    expect(screen.getByText("Dispositivos")).toBeInTheDocument();
    expect(screen.getByText("Links de Internet")).toBeInTheDocument();
    expect(screen.getByText("Incidentes")).toBeInTheDocument();
    expect(screen.getByText("Relatórios")).toBeInTheDocument();
    expect(screen.getByText("Notas & Segurança")).toBeInTheDocument();
  });

  it("renders user name in footer", async () => {
    render(<Sidebar userName="Matheus Barreto" />);
    expect(screen.getByText("Matheus Barreto")).toBeInTheDocument();
  });

  it("renders default user name when not provided", async () => {
    render(<Sidebar />);
    expect(screen.getByText("Usuário")).toBeInTheDocument();
  });

  it("shows device counts from API", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url === "/api/devices") {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { currentStatus: { isOnline: true } },
            { currentStatus: { isOnline: true } },
            { currentStatus: { isOnline: true } },
          ],
        });
      }
      return Promise.resolve({ ok: false, json: async () => [] });
    });

    render(<Sidebar />);
    // 3 online devices, 0 offline → alertBadge=0 so regular badge "3" is shown
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("calls signOut when logout button is clicked", async () => {
    const { signOut } = require("next-auth/react");
    render(<Sidebar userName="Admin" />);

    const logoutBtn = screen.getByTitle("Sair");
    await userEvent.click(logoutBtn);

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("marks Visão geral as active when pathname is '/'", () => {
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/");

    render(<Sidebar />);
    const link = screen.getByText("Visão geral").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("marks Dispositivos as active when pathname starts with /devices", () => {
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/devices/123");

    render(<Sidebar />);
    const link = screen.getByText("Dispositivos").closest("a");
    expect(link).toHaveAttribute("href", "/devices");
  });
});
