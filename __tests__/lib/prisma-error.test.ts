/**
 * @jest-environment node
 */
import { notFoundOnP2025 } from "@/lib/prisma-error";
import { Prisma } from "@prisma/client";

function makeP2025(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Record not found", {
    code: "P2025",
    clientVersion: "7.0.0",
  });
}

describe("notFoundOnP2025", () => {
  it("returns a 404 NextResponse for P2025 errors", async () => {
    const res = notFoundOnP2025(makeP2025());
    expect(res).not.toBeNull();
    expect(res!.status).toBe(404);
    const body = await res!.json();
    expect(body.error).toBe("Not found");
  });

  it("returns null for non-Prisma errors", () => {
    expect(notFoundOnP2025(new Error("generic error"))).toBeNull();
  });

  it("returns null for Prisma errors with a different code", () => {
    const err = new Prisma.PrismaClientKnownRequestError("Unique constraint", {
      code: "P2002",
      clientVersion: "7.0.0",
    });
    expect(notFoundOnP2025(err)).toBeNull();
  });

  it("returns null for non-Error values", () => {
    expect(notFoundOnP2025(null)).toBeNull();
    expect(notFoundOnP2025(undefined)).toBeNull();
    expect(notFoundOnP2025("string error")).toBeNull();
    expect(notFoundOnP2025(42)).toBeNull();
  });
});
