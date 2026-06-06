import { NextResponse } from "next/server";

/**
 * Parses the JSON body of a request, returning a 400 response on invalid JSON
 * instead of letting the unhandled SyntaxError propagate as a 500.
 */
export async function parseBody(
  req: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, data: await req.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "JSON inválido" }, { status: 400 }),
    };
  }
}
