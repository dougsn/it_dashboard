import { render, screen } from "@testing-library/react";
import { BandwidthCell } from "@/components/bandwidth-cell";

describe("BandwidthCell", () => {
  it("renders 'sem dados' when current is null", () => {
    render(<BandwidthCell current={null} contracted={null} color="success" />);
    expect(screen.getByText("sem dados")).toBeInTheDocument();
  });

  it("renders formatted bps value", () => {
    render(<BandwidthCell current={1_000_000} contracted={null} color="success" />);
    expect(screen.getByText("1.0 Mbps")).toBeInTheDocument();
  });

  it("renders contracted bandwidth when provided", () => {
    render(<BandwidthCell current={5_000_000} contracted={10_000_000} color="success" />);
    expect(screen.getByText("5.0 Mbps")).toBeInTheDocument();
    expect(screen.getByText("/ 10.0 Mbps")).toBeInTheDocument();
  });

  it("does not render contracted value when contracted is null", () => {
    render(<BandwidthCell current={1_000_000} contracted={null} color="primary" />);
    expect(screen.queryByText(/\//)).not.toBeInTheDocument();
  });

  it("renders progress bar when contracted is provided", () => {
    const { container } = render(
      <BandwidthCell current={7_000_000} contracted={10_000_000} color="success" />
    );
    const bar = container.querySelector(".h-1");
    expect(bar).toBeInTheDocument();
  });

  it("renders Kbps for sub-megabit values", () => {
    render(<BandwidthCell current={500_000} contracted={null} color="success" />);
    expect(screen.getByText("500 Kbps")).toBeInTheDocument();
  });

  it("applies primary text color when color='primary'", () => {
    const { container } = render(
      <BandwidthCell current={1_000_000} contracted={null} color="primary" />
    );
    expect(container.querySelector(".text-primary")).toBeInTheDocument();
  });

  it("applies success text color when color='success'", () => {
    const { container } = render(
      <BandwidthCell current={1_000_000} contracted={null} color="success" />
    );
    expect(container.querySelector(".text-success")).toBeInTheDocument();
  });
});
