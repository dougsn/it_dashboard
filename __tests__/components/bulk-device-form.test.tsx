import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("reveals the Omada configuration section when the Omada AP type is selected", async () => {
    const user = userEvent.setup();
    render(<BulkDeviceForm />);

    // Default type (Câmera) does not show the Omada section
    expect(screen.queryByText(/Omada Controller API/i)).not.toBeInTheDocument();

    // Switching to Omada AP surfaces the Omada monitor configuration
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText(/Omada AP/i));
    expect(screen.getByText(/Omada Controller API/i)).toBeInTheDocument();
  });
});
