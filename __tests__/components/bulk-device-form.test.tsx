import { render, screen } from "@testing-library/react";
import { BulkDeviceForm } from "@/components/bulk-device-form";

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

describe("BulkDeviceForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders bulk import form", () => {
    render(<BulkDeviceForm />);
    // The form should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it("shows IP range input field", () => {
    render(<BulkDeviceForm />);
    expect(screen.getByLabelText(/ip inicial/i)).toBeInTheDocument();
  });

  it("shows cancel button", () => {
    render(<BulkDeviceForm />);
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });
});
