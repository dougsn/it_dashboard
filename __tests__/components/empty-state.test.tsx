import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/empty-state";
import { Server } from "lucide-react";

describe("EmptyState", () => {
  it("renders the required title", () => {
    render(<EmptyState title="Nenhum dispositivo" />);
    expect(screen.getByText("Nenhum dispositivo")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="Sem resultados"
        description="Tente ajustar os filtros"
      />
    );
    expect(screen.getByText("Tente ajustar os filtros")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(<EmptyState title="Vazio" />);
    expect(screen.queryByText("Tente ajustar os filtros")).not.toBeInTheDocument();
  });

  it("renders action slot when provided", () => {
    render(
      <EmptyState
        title="Vazio"
        action={<button>Adicionar</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <EmptyState title="Vazio" icon={Server} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not render icon when omitted", () => {
    const { container } = render(<EmptyState title="Vazio" />);
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState title="Vazio" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies custom iconClassName when provided", () => {
    const { container } = render(
      <EmptyState title="Vazio" icon={Server} iconClassName="text-red-500" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("text-red-500");
  });
});
