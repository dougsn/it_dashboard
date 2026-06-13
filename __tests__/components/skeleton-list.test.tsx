import { render } from "@testing-library/react";
import { SkeletonList } from "@/components/skeleton-list";

describe("SkeletonList", () => {
  it("renders 5 skeleton items by default", () => {
    const { container } = render(<SkeletonList />);
    const items = container.querySelectorAll(".h-14");
    expect(items).toHaveLength(5);
  });

  it("renders the specified count of items", () => {
    const { container } = render(<SkeletonList count={3} />);
    const items = container.querySelectorAll(".h-14");
    expect(items).toHaveLength(3);
  });

  it("applies custom height class", () => {
    const { container } = render(<SkeletonList count={2} height="h-20" />);
    const items = container.querySelectorAll(".h-20");
    expect(items).toHaveLength(2);
  });

  it("applies custom rounded class", () => {
    const { container } = render(
      <SkeletonList count={1} rounded="rounded-full" />
    );
    expect(container.querySelector(".rounded-full")).toBeInTheDocument();
  });

  it("renders 0 items when count=0", () => {
    const { container } = render(<SkeletonList count={0} />);
    const wrapper = container.querySelector(".space-y-2");
    expect(wrapper?.children).toHaveLength(0);
  });
});
