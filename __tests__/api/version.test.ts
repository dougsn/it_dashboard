/**
 * @jest-environment node
 */
import { GET } from "@/app/api/version/route";
import { execSync } from "child_process";

jest.mock("child_process", () => ({ execSync: jest.fn() }));

const mockExec = execSync as jest.MockedFunction<typeof execSync>;

describe("GET /api/version", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns version with build count and hash when git is available", async () => {
    mockExec
      .mockReturnValueOnce("42\n" as unknown as Buffer)
      .mockReturnValueOnce("abc1234\n" as unknown as Buffer);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.version).toBe("0.1.0");
    expect(body.build).toBe(42);
    expect(body.hash).toBe("abc1234");
  });

  it("returns null build and hash when git commands fail", async () => {
    mockExec.mockImplementation(() => { throw new Error("not a git repo"); });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.build).toBeNull();
    expect(body.hash).toBeNull();
  });

  it("returns null build when rev-list returns empty string", async () => {
    mockExec
      .mockReturnValueOnce("" as unknown as Buffer)
      .mockReturnValueOnce("" as unknown as Buffer);

    const res = await GET();
    const body = await res.json();

    expect(body.build).toBeNull();
    expect(body.hash).toBeNull();
  });
});
