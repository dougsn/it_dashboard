import { render, screen } from "@testing-library/react";
import { DeviceTypeBadge } from "@/components/device-type-badge";

describe("DeviceTypeBadge", () => {
  it("renders 'Mikrotik' for MIKROTIK type", () => {
    render(<DeviceTypeBadge type="MIKROTIK" />);
    expect(screen.getByText("Mikrotik")).toBeInTheDocument();
  });

  it("renders 'DVR' for DVR type", () => {
    render(<DeviceTypeBadge type="DVR" />);
    expect(screen.getByText("DVR")).toBeInTheDocument();
  });

  it("renders 'Câmera' for CAMERA type", () => {
    render(<DeviceTypeBadge type="CAMERA" />);
    expect(screen.getByText("Câmera")).toBeInTheDocument();
  });

  it("renders 'Outro' for OTHER type", () => {
    render(<DeviceTypeBadge type="OTHER" />);
    expect(screen.getByText("Outro")).toBeInTheDocument();
  });

  it("renders 'UniFi AP' for UNIFI_AP type", () => {
    render(<DeviceTypeBadge type="UNIFI_AP" />);
    expect(screen.getByText("UniFi AP")).toBeInTheDocument();
  });

  it("renders a badge element", () => {
    const { container } = render(<DeviceTypeBadge type="MIKROTIK" />);
    expect(container.firstChild).toBeTruthy();
  });
});
