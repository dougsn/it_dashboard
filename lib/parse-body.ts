import { NextResponse } from "next/server";
import type { ZodType } from "zod";

const MAX_BODY_BYTES = 1_048_576; // SEC-026: 1 MB

export async function parseBody(
  req: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  const tooLarge = () =>
    ({ ok: false as const, response: NextResponse.json({ error: "Corpo da requisição excede o limite de 1 MB" }, { status: 413 }) });

  // Fast path: reject early when the client advertises an oversized body.
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) return tooLarge();

  // Defense in depth: a chunked request omits Content-Length, so also enforce the
  // limit on the actual bytes read before parsing (the header check alone is bypassable).
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, response: NextResponse.json({ error: "JSON inválido" }, { status: 400 }) };
  }
  if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) return tooLarge();

  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "JSON inválido" }, { status: 400 }),
    };
  }
}

export async function parseAndValidate<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  const raw = await parseBody(req);
  if (!raw.ok) return raw;
  const result = schema.safeParse(raw.data);
  if (!result.success) {
    return {
      ok: false,
      response: NextResponse.json({ error: result.error.flatten() }, { status: 400 }),
    };
  }
  return { ok: true, data: result.data };
}
