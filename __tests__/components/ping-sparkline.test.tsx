import { render, screen } from "@testing-library/react";
import { PingSparkline } from "@/components/ping-sparkline";

describe("PingSparkline", () => {
  it("returns null when data has fewer than 3 entries", () => {
    const { container } = render(
      <PingSparkline data={[10, 20]} uid="test" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders an SVG when data has 3+ entries", () => {
    const { container } = render(
      <PingSparkline data={[10, 20, 30]} uid="test" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("SVG is aria-hidden for screen readers", () => {
    const { container } = render(
      <PingSparkline data={[10, 20, 30]} uid="test" />
    );
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders with null (offline) entries without crashing", () => {
    const { container } = render(
      <PingSparkline data={[10, null, 30, null, 15]} uid="test" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies responsive width when responsive=true", () => {
    const { container } = render(
      <PingSparkline data={[10, 20, 30]} uid="test" responsive={true} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "100%");
  });

  it("uses fixed width when responsive=false", () => {
    const { container } = render(
      <PingSparkline data={[10, 20, 30]} uid="test" responsive={false} width={80} />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "80");
  });

  it("renders gradient defs per segment", () => {
    const { container } = render(
      <PingSparkline data={[10, 20, null, 30, 40]} uid="sparkuid" />
    );
    const defs = container.querySelector("defs");
    expect(defs).toBeInTheDocument();
    expect(defs!.querySelectorAll("linearGradient").length).toBeGreaterThan(0);
  });

  it("renders a dot at the last data point", () => {
    const { container } = render(
      <PingSparkline data={[10, 20, 30]} uid="test" />
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  it("all data null renders SVG at baseline", () => {
    const { container } = render(
      <PingSparkline data={[null, null, null]} uid="test" />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses unique uid for gradient IDs to prevent collisions", () => {
    const { container: c1 } = render(
      <PingSparkline data={[10, 20, 30]} uid="card-a" />
    );
    const { container: c2 } = render(
      <PingSparkline data={[10, 20, 30]} uid="card-b" />
    );
    const grads1 = Array.from(c1.querySelectorAll("linearGradient")).map(
      (el) => el.id
    );
    const grads2 = Array.from(c2.querySelectorAll("linearGradient")).map(
      (el) => el.id
    );
    grads1.forEach((id) => expect(grads2).not.toContain(id));
  });
});
