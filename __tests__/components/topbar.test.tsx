import { render, screen } from "@testing-library/react";
import { Topbar } from "@/components/topbar";
import { Server } from "lucide-react";

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

describe("Topbar", () => {
  it("renders the title", () => {
    render(<Topbar title="Dispositivos" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dispositivos");
  });

  it("renders subtitle when provided", () => {
    render(<Topbar title="Dispositivos" subtitle="Lista completa" />);
    expect(screen.getByText("Lista completa")).toBeInTheDocument();
  });

  it("does not render subtitle when omitted", () => {
    render(<Topbar title="Dispositivos" />);
    expect(screen.queryByText("Lista completa")).not.toBeInTheDocument();
  });

  it("renders back link when back prop is provided", () => {
    render(<Topbar title="Detalhe" back="/devices" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/devices");
  });

  it("does not render back link when back is omitted", () => {
    render(<Topbar title="Sem voltar" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(<Topbar title="Dispositivos" icon={Server} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders 'Ao vivo' indicator when live=true", () => {
    render(<Topbar title="Dashboard" live={true} />);
    expect(screen.getByText("Ao vivo")).toBeInTheDocument();
  });

  it("does not render live indicator when live=false", () => {
    render(<Topbar title="Dashboard" live={false} />);
    expect(screen.queryByText("Ao vivo")).not.toBeInTheDocument();
  });

  it("renders badge when provided", () => {
    render(<Topbar title="Teste" badge={<span>Beta</span>} />);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders children in the right slot", () => {
    render(
      <Topbar title="Página">
        <button>Ação</button>
      </Topbar>
    );
    expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument();
  });

  it("renders as a header element", () => {
    const { container } = render(<Topbar title="Teste" />);
    expect(container.querySelector("header")).toBeInTheDocument();
  });
});
