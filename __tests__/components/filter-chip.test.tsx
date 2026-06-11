import { render, screen, fireEvent } from "@testing-library/react";
import { FilterChip } from "@/components/filter-chip";

describe("FilterChip", () => {
  it("renders children text", () => {
    render(
      <FilterChip active={false} onClick={() => {}}>
        Online
      </FilterChip>
    );
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(
      <FilterChip active={false} onClick={handleClick}>
        Filtrar
      </FilterChip>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as a button element", () => {
    render(
      <FilterChip active={false} onClick={() => {}}>
        Teste
      </FilterChip>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies active primary classes when active=true and color=default", () => {
    const { container } = render(
      <FilterChip active={true} onClick={() => {}} color="default">
        Ativo
      </FilterChip>
    );
    expect(container.querySelector(".bg-primary")).toBeInTheDocument();
  });

  it("applies success classes when active=true and color=success", () => {
    const { container } = render(
      <FilterChip active={true} onClick={() => {}} color="success">
        Online
      </FilterChip>
    );
    expect(container.querySelector(".bg-success")).toBeInTheDocument();
  });

  it("applies destructive classes when active=true and color=destructive", () => {
    const { container } = render(
      <FilterChip active={true} onClick={() => {}} color="destructive">
        Offline
      </FilterChip>
    );
    expect(container.querySelector(".bg-destructive")).toBeInTheDocument();
  });

  it("applies inactive styles when active=false", () => {
    const { container } = render(
      <FilterChip active={false} onClick={() => {}}>
        Inativo
      </FilterChip>
    );
    expect(container.querySelector(".bg-background")).toBeInTheDocument();
  });
});
